import { attachDebug } from './utils';
import Config from "./config";

import { parseFeed } from "htmlparser2";
import { sendToDiscord } from './discord';

export default {
    async fetch(req, env) {
        try {
            if (req.headers.get('cf-ew-preview-server')) {
                // @ts-ignore
                globalThis.PREVIEW = true;
            }
            attachDebug(req);
            await this.scheduled(null, env);
            return new Response('Fired');
        } catch (e) {
            return new Response(e.stack, { status: 500 });
        }
    },

    async scheduled(_, env) {
        try {
            await this.handleRequest(env);
        } catch (e) {
            // @ts-ignore
            return new Response(e.stack, { status: 500 });
        }
    },
    async handleRequest(env) {
        const rss = await fetch(Config.RSS_FEED)
        const text = await rss.text()
        const feed = parseFeed(text)

        await Promise.all(feed.items.map(async item => {
            const kv = await env.KV.get(item.id, 'json')

            console.log(`-----\nRelease: ${item.id} in KV: (${kv !== null})\n-----`)

            if (kv === null) {
                const messageId = await sendToDiscord(item, env)

                if (messageId !== null) {
                    item.messageId = messageId;
                }

                await env.KV.put(item.id, JSON.stringify(item))

                if (messageId !== null && Config.PUBLISH_CHANNEL_ID !== '') {
                    console.log('Trying to publish...')
                    await publishMessage(messageId, env)
                }

                if (messageId === null) {
                    console.error('SANITY CHECK: Message ID from postNew is null!!');
                }
            }
        }))
        return new Response('Okay!');
    }
}