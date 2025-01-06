import { WASocket } from '@whiskeysockets/baileys';

export async function add(sock: WASocket, chatId: string, conversation: string) {
    const numberToAdd = conversation.split(' ')[1];
    if (numberToAdd) {
        const userId = numberToAdd.replace(/\D/g, '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(chatId, [userId], 'add');
    }
}