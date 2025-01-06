import { WASocket } from '@whiskeysockets/baileys';
import schedule from 'node-schedule';
import normalize from 'normalize-text';
import stringSimilarity from 'string-similarity';

export async function setReminder(sock: WASocket, chatId: string, conversation: string) {
    // Normalizar o texto para evitar variações
    const normalizedConversation = normalize(conversation).toLowerCase();

    // Identificar comandos similares
    const possibleCommands = [
        'me lembrar de', 'lembrar de', 'me lembrar que', 'lembrar que', 'avisar de', 'avisar que'
    ];
    
    const matchedCommand = stringSimilarity.findBestMatch(normalizedConversation, possibleCommands).bestMatch.target;

    // Regex para capturar a tarefa e o horário, com base na normalização e comando mais semelhante
    const regex = new RegExp(`\/lembrete ${matchedCommand} (.+) as (\\d{1,2}:\\d{2})`);
    const match = normalizedConversation.match(regex);

    if (match) {
        const task = match[1].trim();
        const time = match[2];
        const [hour, minute] = time.split(':').map(Number);
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

        if (date < now) {
            date.setDate(date.getDate() + 1); // Agendar para o próximo dia se a hora já passou
        }

        schedule.scheduleJob(date, async () => {
            await sock.sendMessage(chatId, { text: `⏰ *Lembrete:* ${task}` });
        });

        await sock.sendMessage(chatId, { text: `Lembrete definido para ${time} ✅` });
    } else {
        await sock.sendMessage(chatId, { text: 'Formato inválido. Uso: /lembrete me lembrar de [tarefa] às [HH:MM]' });
    }
}
