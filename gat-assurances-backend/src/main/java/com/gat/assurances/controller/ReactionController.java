package com.gat.assurances.controller;

import com.gat.assurances.entity.Reaction;
import com.gat.assurances.entity.ReactionType;
import com.gat.assurances.entity.User;
import com.gat.assurances.repository.ReactionRepository;
import com.gat.assurances.repository.CommentaireRepository;
import com.gat.assurances.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/commentaires/{commentaireId}/reactions")
@RequiredArgsConstructor
public class ReactionController {

    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final CommentaireRepository commentaireRepository;

    @PostMapping
    public ResponseEntity<Map<String, Object>> toggleReaction(@PathVariable Long commentaireId,
                                                              @RequestParam(defaultValue = "LIKE") String type,
                                                              Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        var existing = reactionRepository.findByCommentaireIdAndUserId(commentaireId, user.getId());
        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
            Map<String,Object> resp = new HashMap<>();
            resp.put("action","deleted");
            return ResponseEntity.ok(resp);
        }
        Reaction r = Reaction.builder()
                .commentaire(commentaireRepository.findById(commentaireId).orElseThrow())
                .user(user)
                .type(ReactionType.valueOf(type))
                .build();
        reactionRepository.save(r);
        Map<String,Object> resp = new HashMap<>();
        resp.put("action","created");
        resp.put("id", r.getId());
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<List<Reaction>> list(@PathVariable Long commentaireId) {
        return ResponseEntity.ok(reactionRepository.findByCommentaireId(commentaireId));
    }
}
