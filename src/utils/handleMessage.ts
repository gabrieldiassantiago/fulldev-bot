import { WASocket } from '@whiskeysockets/baileys';
import { all } from '../commands/all';
import { add } from '../commands/add';
import { dell } from '../commands/ban';
import { makeadmin, removeadmin } from '../commands/admin';
import { setReminder } from '../commands/lembrete';
import { checkForGroupLink } from '../commands/checkGroup';
import { vagas } from '../commands/vagas';
import { endQuiz, handleQuizAnswer, quizDiario } from '../commands/game';
import { sendCommunityRules } from '../commands/showHelp';
import { lockChat, unlockChat } from '../commands/lockGroup';

export async function handleMessage(sock: WASocket, m: any, TARGET_GROUP_ID: string) {
    const msg = m.messages[0];

    // Verifica se a mensagem tem texto
    const messageContent = msg.message?.extendedTextMessage?.text || msg.message?.conversation;
    if (!messageContent) return;

    const chatId = msg.key.remoteJid!;
    const senderId = msg.key.participant || msg.key.remoteJid; // ID do remetente

    // Verifica se a mensagem é do grupo alvo
    if (chatId !== TARGET_GROUP_ID) return;

    // Novo código para detectar links de grupo
    if (await checkForGroupLink(sock, chatId, msg)) return;

    const conversation = messageContent;

    // Verifica se a mensagem contém um comando válido
    if (
        conversation.startsWith('/help') ||
        conversation.startsWith('/rules') ||
        conversation.startsWith('/cuuuuuuuuuu') ||
        conversation.startsWith('/ban') ||
        conversation.startsWith('/add') ||
        conversation.startsWith('/admin') ||
        conversation.startsWith('/removeadmin') ||
        conversation.startsWith('/vagas') ||
        conversation.startsWith('/lembrete') ||
        conversation.startsWith('/quiz') ||
        conversation.startsWith('/lock') ||
        conversation.startsWith('/unlock') ||
        conversation.startsWith('teste')  // Novo comando de teste
    ) {
        try {
            const groupMetadata = await sock.groupMetadata(chatId);

            const isAdmin = groupMetadata.participants.some((participant: any) => 
                participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin')
            );

            console.log('ID do remetente:', senderId); 
            console.log('Participantes do grupo:', groupMetadata.participants); 

            if (!isAdmin && !conversation.startsWith('/quiz') && !conversation.startsWith('/exit') && !conversation.startsWith('/help') && !conversation.startsWith('/rules')) {
                await sock.sendMessage(chatId, { text: 'Você precisa ser um administrador para usar este comando.' });
                return;
            }

            if (conversation.startsWith('/help')) {
                await sendCommunityRules(sock, chatId);
            } else if (conversation.startsWith('/cuuuuuuuuuu')) {
                await all(sock, chatId, conversation, groupMetadata, msg);
            } else if (conversation.startsWith('/ban')) {
                await dell(sock, chatId, msg, conversation); // Passando 'msg' como terceiro argumento
            } else if (conversation.startsWith('/add')) {
                await add(sock, chatId, conversation);
            } else if (conversation.startsWith('/admin')) {
                await makeadmin(sock, chatId, conversation);
            } else if (conversation.startsWith('/removeadmin')) {
                await removeadmin(sock, chatId, conversation);
            } else if (conversation.startsWith('/lembrete')) {
                await setReminder(sock, chatId, conversation);
            } else if (conversation.startsWith('/vagas')) {
                await vagas(sock, chatId, conversation);
            } else if (conversation.startsWith('/quiz')) {
                await quizDiario(sock, chatId, senderId); // Adicionando 'senderId' para verificar se é admin
            } else if (conversation.startsWith('/exit')) {
                await endQuiz(sock, chatId);
            } else if (conversation.startsWith('/lock')) {
                await lockChat(sock, chatId, senderId)
            } else if (conversation.startsWith('/unlock')) {
                await unlockChat(sock, chatId, senderId)
            } else if (conversation.startsWith('kkkk')) {  // Novo comando de teste
                await sock.sendMessage(chatId, { text: '' });
                console.log('Informações do grupo:', groupMetadata);
            }
        } catch (error) {
            console.error('Erro ao processar o comando:', error);
        }
    } else {
        // Se a mensagem não for um comando, verificar se é uma resposta do quiz
        try {
            await handleQuizAnswer(sock, chatId, senderId, conversation);
        } catch (error) {
            console.error('Erro ao processar a resposta do quiz:', error);
        }
    }
}
