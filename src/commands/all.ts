import { WASocket, proto } from '@whiskeysockets/baileys';

export async function all(sock: WASocket, chatId: string, conversation: string, groupMetadata: any, msg: proto.IWebMessageInfo) {
    const mentions = groupMetadata.participants.map((p: any) => p.id);
    
    // Extrair o texto após o comando
    const args = conversation.split(' ').slice(1);
    let messageText = args.join(' ');

    // Se não houver mensagem adicional, verificar se há uma mensagem citada
    if (!messageText) {
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            // Encaminhar a mensagem citada com menções
            try {
                await sock.sendMessage(chatId, {
                    forward: {
                        key: {
                            fromMe: false,
                            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                            remoteJid: chatId,
                        },
                        message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
                    },
                    mentions: mentions,
                });
                console.log('Mensagem citada encaminhada com sucesso mencionando todos os membros:', mentions);
            } catch (error) {
                console.error('Erro ao encaminhar a mensagem citada:', error);
            }
            return;
        } else {
            // Mensagem curta se não houver mensagem citada ou texto adicional
            messageText = `🚀 *Spoiler:* O próximo hackathon da FullDev está chegando! Prepare-se para desafios emocionantes e uma excelente oportunidade de networking com outros desenvolvedores. 💡 Fique ligado para mais detalhes em breve! #HackathonFullDev`;
        }
    }

    // Enviar a mensagem com menções
    try {
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: mentions,
        });
        console.log('Mensagem enviada com sucesso para todos os membros:', messageText, mentions);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
    }
}
