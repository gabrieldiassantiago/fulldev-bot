import dotenv from 'dotenv';import { getGroupIds } from './commands/getGroupIds';
import { connectToWhatsApp } from './utils/authenticate';
import { handleMessage } from './utils/handleMessage';

dotenv.config();

const TARGET_GROUP_ID = process.env.TARGET_GROUP_ID || '120363368359389841@g.us';

async function start() {
    const sock = await connectToWhatsApp();

    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        console.log('Conexão atualizada:', connection);
    });

    sock.ev.on('messages.upsert', async (m) => {
        await handleMessage(sock, m, TARGET_GROUP_ID);
    });

    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        
        if (id === TARGET_GROUP_ID) {
            if (action === 'add') {
                for (const participant of participants) {
                    await sendWelcomeMessage(sock, TARGET_GROUP_ID, participant);
                }
            }
        }
    });
}

async function sendWelcomeMessage(sock: any, chatId: string, participant: string) {
    const message = `👋 Olá @${participant.split('@')[0]}, seja muito bem-vindo(a) ao *Grupo de Desenvolvedores*! ✨ Aqui estão algumas dicas para começar: - Leia as regras na descrição do grupo. 📜 - Apresente-se para que possamos conhecê-lo(a) melhor. 😊 - Sinta-se à vontade para fazer perguntas e compartilhar conhecimento. 💡 Estamos felizes em tê-lo(a) conosco! 🚀 `;    await sock.sendMessage(chatId, { text: message, mentions: [participant] });
}

start();
