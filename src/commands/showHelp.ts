import { WASocket } from '@whiskeysockets/baileys';

export async function sendCommunityRules(sock: WASocket, chatId: string) {
    const rulesMessage = `🌟 *Regras da Comunidade FullDev* 🌟
    
1. *🚫 Proibição de Discussões Políticas*
   - Não é permitido falar sobre política, candidatos ou questões partidárias.

2. *🤝 Respeito Mútuo*
   - Trate todos com respeito. Discriminação com base em cor da pele, etnia, religião, orientação sexual, gênero, etc., não será tolerada.

3. *🛠️ Resolução de Conflitos*
   - Resolva desacordos de forma respeitosa e, se necessário, peça mediação.

4. *🗣️ Comunicação Clara e Objetiva*
   - Use uma linguagem clara e respeitosa. Evite ofensas e gírias inadequadas.

5. *👥 Colaboração e Ajuda*
   - Ajude os membros quando possível e ofereça feedback construtivo.

6. *📅 Compromisso com o Projeto*
   - Cumpra as tarefas dentro dos prazos ou avise se precisar de ajuda.

7. *💻 Discussões Técnicas*
   - Mantenha as discussões focadas no projeto e nas soluções técnicas.

8. *📈 Foco no Crescimento Profissional*
   - Concentre-se em desenvolver habilidades e compartilhar conhecimento.

---

⚠️ *Nota:* O descumprimento das regras pode levar à expulsão sem aviso prévio, principalmente as regras 1, 2 e 3.

---

    `;

    await sock.sendMessage(chatId, { text: rulesMessage });
}
