import { WASocket } from '@whiskeysockets/baileys';

export async function lockChat(sock: WASocket, chatId: string, senderId: string) {
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

    try {
        // Alterar as configurações do grupo para permitir que apenas administradores enviem mensagens
        await sock.groupSettingUpdate(chatId, 'announcement');
        await sock.sendMessage(chatId, { text: '🔒 O chat foi trancado. Apenas administradores podem enviar mensagens.' });
    } catch (error) {
        console.error('Erro ao trancar o chat:', error);
        await sock.sendMessage(chatId, { text: '❌ Ocorreu um erro ao trancar o chat.' });
    }
}

export async function unlockChat(sock: WASocket, chatId: string, senderId: string) {
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

    try {
        // Alterar as configurações do grupo para permitir que todos enviem mensagens
        await sock.groupSettingUpdate(chatId, 'not_announcement');
        await sock.sendMessage(chatId, { text: '🔓 O chat foi destrancado. Todos os membros podem enviar mensagens.' });
    } catch (error) {
        console.error('Erro ao destrancar o chat:', error);
        await sock.sendMessage(chatId, { text: '❌ Ocorreu um erro ao destrancar o chat.' });
    }
}
