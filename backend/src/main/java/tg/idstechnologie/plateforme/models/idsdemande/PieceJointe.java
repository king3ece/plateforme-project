package tg.idstechnologie.plateforme.models.idsdemande;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import tg.idstechnologie.plateforme.models.base.BaseEntity;
import tg.idstechnologie.plateforme.secu.user.User;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "piece_jointes")
@EntityListeners(AuditingEntityListener.class)
public class PieceJointe extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "pieceJointe")
    private List<FileDataPieceJointe> fileDataPieceJointeList;
}
