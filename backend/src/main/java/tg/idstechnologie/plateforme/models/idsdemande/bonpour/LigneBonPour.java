package tg.idstechnologie.plateforme.models.idsdemande.bonpour;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ligne_bon_pours")
@EntityListeners(AuditingEntityListener.class)
public class LigneBonPour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "reference")
    private String reference = UUID.randomUUID().toString();

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, name = "is_delete")
    private Boolean delete = false;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    @CreatedDate
    @Column(nullable = false, updatable = false, name = "create_date")
    private LocalDateTime createDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    @LastModifiedDate
    @Column(insertable = false, name = "last_modified")
    private LocalDateTime lastModified;

    @CreatedBy
    @Column(nullable = false, updatable = false, name = "create_by")
    private Long createdBy;

    @LastModifiedBy
    @Column(insertable = false, name = "last_modified_by")
    private Long lastModifiedBy;

    @ManyToOne
    @JoinColumn(name = "bon_pour_id", nullable = false)
    private BonPour bonPour;

    @Column(name = "libelle", nullable = false)
    private String libelle;

    @Column(name = "montant", nullable = false)
    private Double montant;
}
