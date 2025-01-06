import { WASocket } from '@whiskeysockets/baileys';
import axios from 'axios';

let sentJobIds: string[] = []; // Array para armazenar IDs das vagas já enviadas

export async function vagas(sock: WASocket, chatId: string, conversation: string) {
    const appId = 'b089d185';   // Use suas credenciais corretas
    const apiKey = 'cf3eba305949760401eded61fe803ff5'; // Use suas credenciais corretas

    const query = conversation.replace('/vagas', '').trim() || 'Criador de conteúdo';

    // Parâmetros da requisição
    const params = {
        app_id: appId,
        app_key: apiKey,
        results_per_page: 12, // Pedimos mais vagas para garantir variedade
        what: query
    };

    console.log(sentJobIds)

    try {
        const response = await axios.get('https://api.adzuna.com/v1/api/jobs/br/search/1', { params });

        const jobs = response.data.results.filter((job: any) => !sentJobIds.includes(job.id)); // Filtrar vagas já enviadas

        if (jobs.length === 0) {
            await sock.sendMessage(chatId, { text: 'Nenhuma nova vaga encontrada no momento para o cargo informado.' });
            return;
        }

        const jobsToSend = jobs.slice(0, 2);

        let message = `*📢 Vagas de Emprego para "${query}":*\n\n`;
        jobsToSend.forEach((job: any, index: number) => {
            message += `*${index + 1}. ${job.title}*\n`;
            message += `📝 *Empresa:* ${job.company.display_name}\n`;
            message += `📍 *Localização:* ${job.location.display_name}\n`;
            message += `💰 *Salário:* ${job.salary_min ? 'R$' + job.salary_min.toLocaleString('pt-BR') : 'Não informado'}\n`;
            message += `🔗 *Link:* ${job.redirect_url}\n\n`;
            sentJobIds.push(job.id); 
        });

        // Enviar a mensagem ao grupo
        await sock.sendMessage(chatId, { text: message });

    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        await sock.sendMessage(chatId, { text: 'Desculpe, ocorreu um erro ao buscar as vagas.' });
    }
}
