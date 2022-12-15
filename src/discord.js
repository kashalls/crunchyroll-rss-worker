import Config from './config'

// {
//  "media": [
//    {
//      "medium": "video",
//      "isDefault": false,
//      "type": "video/mp4",
//      "duration": 1440
//    }
//  ],
//  "id": "http://www.crunchyroll.com/media-883125",
//  "title": "DARLING in the FRANXX (English-IN Dub) - Episode 5 - Your Thorn, My Badge",
//  "link": "http://www.crunchyroll.com/darling-in-the-franxx/episode-5-your-thorn-my-badge-883125",
// // "description": "<img src=\"https://img1.ak.crunchyroll.com/i/spire2-tmb/fb06fb91d32aa42e41eaa473aa0ffe231518247908_thumb.jpg\"  /><br />It's time for Plantations 13 and 26 to start kissing, and the squad prepares for the huge battle this will cause. They also have to get used to Hiro being Zero Two's partner, and so does he.",
//  "pubDate": "2022-12-14T08:00:00.000Z"
//}

export async function sendToDiscord(post, env) {
    if (Config.EXCLUDED_KEYWORDS.includes(post)) {
        return null;
    }

    const fields = []
    // THIS IS NOT A SAFE WAY TO CLEAN HTML TAGS
    let description = post.description.replace(/<\/?[^>]+(>|$)/g, "");

    const message = {
        username: Config.NAME,
        avatar_url: Config.AVATAR_URL,
        content: `<:crunchyroll:1052806230462185562> | **${post.title}**\n\n${post.link}`
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

    console.log(`  Discord response: ${res.status} - ${txt}`);

    if (res.status === 200) {
        // Return the message ID
        const body = JSON.parse(txt);
        console.log(`  Discord message ID: ${body.id}`);
        return body.id;
    } else {
        console.log(res)
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