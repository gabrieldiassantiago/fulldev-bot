import { WASocket } from '@whiskeysockets/baileys';

export async function dell(sock: WASocket, chatId: string, conversation: string) {
    const userToRemove = conversation.split(' ')[1];
    if (userToRemove) {
        const userId = userToRemove.replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(chatId, [userId], 'remove');
        await sock.sendMessage(chatId, { text: `Usuário ${userToRemove} foi removido do grupo.` });
    }
}