import { WASocket } from '@whiskeysockets/baileys';
import axios from 'axios';

// Variável para acompanhar o quiz atual
let quizAtual: {
    chatId: string;
    pergunta: string;
    opcoes: string[];
    respostaCorreta: string;
    respondida: boolean;
} | null = null;

const pontuacoes: { [key: string]: number } = {};

export async function quizDiario(sock: WASocket, chatId: string, senderId: string) {
    // Verificar se o remetente é administrador
    const groupMetadata = await sock.groupMetadata(chatId);
    const isAdmin = groupMetadata.participants.some((participant: any) => 
        participant.id === senderId && (participant.admin === 'admin' || participant.admin === 'superadmin')
    );

    if (!isAdmin) {
        await sock.sendMessage(chatId, { text: 'Você precisa ser um administrador para iniciar um quiz.' });
        return;
    }

    if (quizAtual && quizAtual.chatId === chatId && !quizAtual.respondida) {
        await sock.sendMessage(chatId, { text: 'Um quiz já está em andamento! Por favor, responda à pergunta atual.' });
        return;
    }

    try {
        // Obter uma pergunta da Open Trivia Database
        const response = await axios.get('https://opentdb.com/api.php', {
            params: {
                amount: 1,
                type: 'multiple',
                category: 18, // Categoria 18 é "Ciência da Computação"
                difficulty: 'hard'
            },
        });

        const data = response.data;

        if (data.response_code !== 0 || data.results.length === 0) {
            await sock.sendMessage(chatId, { text: 'Desculpe, não foi possível obter uma pergunta no momento.' });
            return;
        }

        const questionData = data.results[0];

        // Decodificar entidades HTML
        const htmlDecode = (input: string) => {
            return input.replace(/&quot;/g, '"')
                        .replace(/&#039;/g, "'")
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&eacute;/g, 'é')
                        .replace(/&uuml;/g, 'ü')
                        .replace(/&ouml;/g, 'ö');
        };

        const pergunta = htmlDecode(questionData.question);
        const respostaCorreta = htmlDecode(questionData.correct_answer);
        const respostasIncorretas = questionData.incorrect_answers.map((ans: string) => htmlDecode(ans));

        // Combinar e embaralhar as opções
        const opcoes = [respostaCorreta, ...respostasIncorretas].sort(() => Math.random() - 0.5);

        quizAtual = {
            chatId,
            pergunta,
            opcoes,
            respostaCorreta,
            respondida: false,
        };

        // Construir a mensagem com as opções
        let mensagem = `🤖 *Quiz de Programação!* 🤖\n\n`;
        mensagem += `*Pergunta:* ${pergunta}\n\n`;
        mensagem += `*Opções:*\n`;
        quizAtual.opcoes.forEach((opcao, indice) => {
            mensagem += `${indice + 1}. ${opcao}\n`;
        });
        mensagem += `\nResponda com o número da opção correta (ex: 1). Boa sorte!`;

        // Enviar a pergunta ao grupo
        await sock.sendMessage(chatId, { text: mensagem });

    } catch (error) {
        console.error('Erro ao obter pergunta:', error);
        await sock.sendMessage(chatId, { text: 'Desculpe, ocorreu um erro ao obter a pergunta.' });
    }
}

// Função para lidar com respostas e atualizar a pontuação
export async function handleQuizAnswer(sock: WASocket, chatId: string, senderId: string, messageText: string) {
    if (!quizAtual || quizAtual.chatId !== chatId || quizAtual.respondida) {
        return;
    }

    // Verificar se a mensagem é uma opção válida
    const numeroOpcao = parseInt(messageText.trim());
    if (isNaN(numeroOpcao) || numeroOpcao < 1 || numeroOpcao > quizAtual.opcoes.length) {
        return;
    }

    const opcaoSelecionada = quizAtual.opcoes[numeroOpcao - 1];

    if (opcaoSelecionada === quizAtual.respostaCorreta) {
        quizAtual.respondida = true;

        // Atualizar a pontuação do usuário
        if (!pontuacoes[senderId]) {
            pontuacoes[senderId] = 0;
        }
        pontuacoes[senderId] += 1;

        // Anunciar o vencedor e a pontuação atualizada
        await sock.sendMessage(chatId, {
            text: `🎉 Parabéns, @${senderId.split('@')[0]}! Você acertou a resposta: *${quizAtual.respostaCorreta}*\n\nSua pontuação atual é: ${pontuacoes[senderId]} ponto(s).`,
            mentions: [senderId],
        });

        // Limpar o quiz atual
        quizAtual = null;
    } else {
        // Informar resposta incorreta
        await sock.sendMessage(chatId, {
            text: `❌ Resposta incorreta, @${senderId.split('@')[0]}. Tente novamente!`,
            mentions: [senderId],
        });
    }
}

// Função para encerrar o quiz
export async function endQuiz(sock: WASocket, chatId: string) {
    if (!quizAtual || quizAtual.chatId !== chatId) {
        await sock.sendMessage(chatId, { text: 'Não há um quiz em andamento para encerrar.' });
        return;
    }

    // Anunciar o encerramento do quiz
    await sock.sendMessage(chatId, { text: 'O quiz foi encerrado sem um vencedor. Tente novamente mais tarde!' });

    // Limpar o quiz atual
    quizAtual = null;
}
