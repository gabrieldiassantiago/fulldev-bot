import { WASocket } from '@whiskeysockets/baileys';

export async function getGroupIds(sock: WASocket) {
    try {
        // Verifique se a conexão está aberta
        if (!sock.user) { // Verifica se o usuário está autenticado
            console.error('Conexão não está aberta. Não é possível obter os IDs dos grupos.');
            return [];
        }

        const groups = await sock.groupFetchAllParticipating();
        const groupDetails = Object.entries(groups).map(([id, metadata]) => ({
            id,
            name: metadata.subject
        }));

        groupDetails.forEach(group => {
            console.log(`Group ID: ${group.id}, Group Name: ${group.name}`);
        });

        return groupDetails;
    } catch (error) {
        console.error('Erro ao obter os IDs dos grupos:', error);
        return [];
    }
}