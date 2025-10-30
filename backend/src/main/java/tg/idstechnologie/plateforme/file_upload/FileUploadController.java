package tg.idstechnologie.plateforme.file_upload;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import tg.idstechnologie.plateforme.response.ResponseModel;

import java.io.IOException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/file")
public class FileUploadController {

    private final StorageService storageService;

    @Autowired
    public FileUploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    //@GetMapping
    public String listUploadedFiles(Model model) throws IOException {

        model.addAttribute("files", storageService.loadAll().map(
                        path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
                                "serveFile", path.getFileName().toString()).build().toUri().toString())
                .collect(Collectors.toList()));

        return "uploadForm";
    }

    @GetMapping("/{file_data_doc_ref}/{folderRef}/{userRef}/{file_data_ref}/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(
            @PathVariable String filename,
            @PathVariable String file_data_doc_ref,
            @PathVariable String folderRef,
            @PathVariable String userRef,
            @PathVariable String file_data_ref

    ) {
        Resource file = storageService.loadAsResource(filename,file_data_doc_ref,folderRef,userRef,file_data_ref);

        if (file == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
    }

    @PostMapping
    public ResponseModel handleFileUpload(@RequestParam("file") MultipartFile file,
                                          RedirectAttributes redirectAttributes) {

        return storageService.store(file);
        /*redirectAttributes.addFlashAttribute("message",
                "You successfully uploaded " + file.getOriginalFilename() + "!");*/

        /*return "redirect:/";*/
    }



}
