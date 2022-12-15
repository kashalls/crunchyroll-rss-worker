import Config from './config'

export async function sendToDiscord(post, env) {
    if (Config.EXCLUDED_KEYWORDS.some((item) => post.title.includes(item))) {
        return null;
    }

    const message = {
        username: Config.NAME,
        avatar_url: Config.AVATAR_URL,
        content: `<:crunchyroll:1052806230462185562>  |  **${post.title}**\n\n${post.link}`
    }

    console.log(`Sending POST to Discord with ${JSON.stringify(message)}`)

    // Always make sure ?wait=true is there so we get the message back from Discord
    const res = await fetch(env.DISCORD_WEBHOOK + '?wait=true', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });
    const txt = await res.text();

    if (res.status === 200) {
        // Return the message ID
        const body = JSON.parse(txt);
        console.log(`  Discord message ID: ${body.id}`);
        return body.id;
    } else {
        console.log(txt)
        return null;
    }
}

export async function publishMessage(messageId, env) {
    const res = await fetch(`https://discord.com/api/v9/channels/${Config.PUBLISH_CHANNEL_ID}/messages/${messageId}/crosspost`, {
      method: 'POST',
      headers: {
        Authorization: 'Bot ' + env.DISCORD_TOKEN
      }
    });
  
    if (res.ok) {
      const json = await res.json();
      console.log('Published', json);
    } else {
      let body = 'null';
      try {
        body = await res.text();
      } catch (e) {}
  
      console.error(`Failed to publish. Status: ${res.status} - Body: ${body}`);
    }
  }