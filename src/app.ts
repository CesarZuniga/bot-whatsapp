import { createBot, createProvider, createFlow, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { citasFlow } from './flows/citas.flow';

export const createBotInstance = async () => {
    const adapterProvider = createProvider(BaileysProvider);
    const adapterDB = new MemoryDB();
     const adapterFlow = createFlow([citasFlow])
    
    const botInstance = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB
    });
    const handleCtx = botInstance.handleCtx;
    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot?.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot?.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot?.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot?.blacklist.remove(number)
            if (intent === 'add') bot?.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    return botInstance;
}