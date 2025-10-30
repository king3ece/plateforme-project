package tg.idstechnologie.plateforme.models.idsdemande;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseEntity;
import tg.idstechnologie.plateforme.models.data_models.FileData;
import tg.idstechnologie.plateforme.models.structure.Poste;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "file_data_piece_jointes")
@EntityListeners(AuditingEntityListener.class)
public class FileDataPieceJointe  extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "file_data_id")
    private FileData fileData;

    @ManyToOne
    @JoinColumn(name = "piece_jointe_id")
    private PieceJointe pieceJointe;
}
