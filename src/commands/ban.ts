import { WASocket } from '@whiskeysockets/baileys';

export async function dell(sock: WASocket, chatId: string, msg: any, conversation: string) {
    const senderId = msg.key.participant || msg.key.remoteJid;

    // Obter metadados do grupo
    const groupMetadata = await sock.groupMetadata(chatId);

    // Verificar se o remetente é administrador
    const isAdmin = groupMetadata.participants.some((participant: any) => 
        participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin')
    );

    if (!isAdmin) {
        await sock.sendMessage(chatId, { text: '⚠️ Você não tem permissão para usar este comando.' });
        return;
    }

    const userToRemove = conversation.split(' ')[1];
    if (userToRemove) {
        const userId = userToRemove.replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(chatId, [userId], 'remove');
        await sock.sendMessage(chatId, { text: `Usuário ${userToRemove} foi removido do grupo.` });
    }
}
