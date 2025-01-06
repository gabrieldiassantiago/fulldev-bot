import { WASocket } from '@whiskeysockets/baileys';

export async function checkForGroupLink(sock: WASocket, chatId: string, msg: any) {
    if (!msg.message || !msg.message.extendedTextMessage || !msg.message.extendedTextMessage.text) {
        return false;
    }

    const conversation = msg.message.extendedTextMessage.text;
    const senderId = msg.key.participant || msg.key.remoteJid;
    const messageKey = msg.key;

    const groupLinkRegex = /(https?:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+)/g;

    if (groupLinkRegex.test(conversation)) {
        try {
            // Obter metadados do grupo
            const groupMetadata = await sock.groupMetadata(chatId);

            // Verificar se o bot é administrador
            const botNumber = sock.user!.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = groupMetadata.participants.some((participant: any) => 
                participant.id === botNumber && (participant.admin === 'admin' || participant.admin === 'superadmin')
            );

            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '⚠️ *Aviso:* Eu preciso ser administrador para alertar membros e apagar mensagens que compartilham links de outros grupos.' 
                });
                return true;
            }

            // Enviar mensagem de aviso com emojis
            await sock.sendMessage(chatId, { 
                text: `🚫 *Atenção @${senderId.split('@')[0]}!* 🚫\n\nPor favor, não compartilhe links de outros grupos aqui. Sua mensagem foi removida.`, 
                mentions: [senderId] 
            });

            // Apagar a mensagem do remetente
            await sock.sendMessage(chatId, { delete: messageKey });

        } catch (error) {
            console.error('Erro ao enviar mensagem de aviso ou apagar mensagem:', error);
            await sock.sendMessage(chatId, { 
                text: '❌ Ocorreu um erro ao tentar enviar a mensagem de aviso ou apagar a mensagem.' 
            });
        }
        return true; // Retorna true para indicar que o link foi tratado
    }
    return false; // Retorna false para continuar com outros comandos
}
