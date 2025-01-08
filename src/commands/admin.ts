import { WASocket } from '@whiskeysockets/baileys';

export async function makeadmin(sock: WASocket, chatId: string, conversation: string) {
    const userToMakeAdmin = conversation.split(' ')[1];
    if (userToMakeAdmin) {
        const userId = userToMakeAdmin.replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(chatId, [userId], 'promote');
    }
}

export async function removeadmin(sock: WASocket, chatId: string, conversation: string) {
    const userToDemote = conversation.split(' ')[1];
    if (!userToDemote) {
        await sock.sendMessage(chatId, { text: 'Por favor, mencione o usuário que você deseja remover como admin.' });
        return;
    }

    const userId = userToDemote.replace('@', '') + '@s.whatsapp.net';

    try {
        await sock.groupParticipantsUpdate(chatId, [userId], 'demote');
        await sock.sendMessage(chatId, { text: `Usuário ${userToDemote} foi removido como administrador.` });
    } catch (error) {
        await sock.sendMessage(chatId, { text: 'Erro ao remover o administrador. Certifique-se de que o número está correto e o bot tem as permissões necessárias.' });
        console.error('Erro ao remover o administrador:', error);
    }
}
