import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

export async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,

        printQRInTerminal: true,
    });

    // Gerenciar atualizações de conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Conexão fechada, tentando reconectar...');
                setTimeout(() => {
                    connectToWhatsApp();
                }, 5000);
            } else {
                console.log('Sessão encerrada. Por favor, reinicie a aplicação para gerar um novo QR Code.');
            }
        } else if (connection === 'open') {
            console.log('Conexão estabelecida com sucesso!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}
