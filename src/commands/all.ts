import { WASocket } from '@whiskeysockets/baileys';

export async function all(sock: WASocket, chatId: string, conversation: string, groupMetadata: any) {
    const mentions = groupMetadata.participants.map((p: any) => p.id);

    // Remove "/all" e pega o texto após o comando
    const messageContent = conversation.replace("/all", "").trim();
    const visibleMessage = "🚨";

    // Cria uma string com todos os @membros, mas com caracteres invisíveis
    const invisibleMentions = mentions.map(() => '\u200B').join('');

    // Envia a mensagem com o texto desejado e menções ocultas
    await sock.sendMessage(
        chatId,
        {
            text: `${visibleMessage}${invisibleMentions}`,  // Mensagem + menções invisíveis
            mentions
        }
    );
}