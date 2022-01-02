import {
    // main APIs
    Client,
    middleware,

    // exceptions
    JSONParseError,
    SignatureValidationFailed,

    // types
    TemplateMessage,
    WebhookEvent,

    ClientConfig,
    MiddlewareConfig
} from "@line/bot-sdk";
import * as Types from "@line/bot-sdk/lib/types";
import express = require('express');
import axios from 'axios'
var config_data = require('../config');
import { statusBedrock } from 'minecraft-server-util';

const config: ClientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
}
const middlewareConfig: MiddlewareConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
};

const client = new Client(config)
const app: express.Express = express();

app.get('/', (req: express.Request, res: express.Response): void => {
    res.send('起動したよ！');
});

app.post('/api/line/message',
    middleware(middlewareConfig),
    async (req: express.Request, res: express.Response): Promise<void> => {
        const events: WebhookEvent[] = req.body.events;
        events.map(
            async (event: WebhookEvent): Promise<void> => {
                try {
                    if (event.type !== 'message' || event.message.type !== 'text') {
                        return;
                    }
                    const { replyToken } = event;
                    const { text } = event.message;

                    if (text == "サーバー") {
                        //const checking_message: Types.Message = { type: "text", text: "確認中…" };
                        //await client.replyMessage(replyToken, checking_message);
                        let text = ""
                        try {
                            const result = await statusBedrock(config_data.host, config_data.port, { enableSRV: true })
                            text += "サーバーは🟩オンライン\n"


                            text += `${result.motd.clean}`
                            text += `プレイヤー: ${result.players.online}/${result.players.max}`


                            text += `${result.gameMode}をプレイ中`
                        } catch (e) {
                            text += "サーバーは🟥オフライン"
                        }
                        const message: Types.Message = { type: "text", text: text };
                        await client.replyMessage(replyToken, message);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        );
    }
);

app.listen(3000, (): void => {
    console.log('起動した');
});