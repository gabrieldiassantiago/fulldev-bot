import { getGroupIds } from './commands/getGroupIds';
import { connectToWhatsApp } from './utils/authenticate';
import { handleMessage } from './utils/handleMessage';

const TARGET_GROUP_ID = '120363306015581649@g.us'; // Defina o ID do seu grupo aqui

async function start() {
    const sock = await connectToWhatsApp();

    // Adicionar um atraso de 2 segundos após a conexão
    setTimeout(async () => {
        await getGroupIds(sock);
    }, 2000);

    // Listener para reconexão
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        console.log('Conexão atualizada:', connection);
    });

    // Listener para mensagens recebidas
    sock.ev.on('messages.upsert', async (m) => {
        await handleMessage(sock, m, TARGET_GROUP_ID);
    });

    // **Novo Listener para atualizações de participantes do grupo**
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        
        // Verifica se é o grupo alvo
        if (id === TARGET_GROUP_ID) {
            if (action === 'add') {
                // Envia mensagem de boas-vindas para cada novo participante
                for (const participant of participants) {
                    await sendWelcomeMessage(sock, TARGET_GROUP_ID, participant);
                }
            }
        }
    });
}

// Função para enviar mensagem de boas-vindas
async function sendWelcomeMessage(sock: any, chatId: string, participant: string) {
    const message = `👋 Olá @${participant.split('@')[0]}, bem-vindo(a) ao grupo! Por favor, leia as regras na descrição e sinta-se à vontade para participar das discussões.`;
    await sock.sendMessage(chatId, { text: message, mentions: [participant] });
}

// Iniciar a conexão
start();
