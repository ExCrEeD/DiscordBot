import { commands } from "./command.js";
import { discordData } from "./data/discordData.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import ytdl from "ytdl-core";
import { Client, Intents } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";
import axios from "axios";

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
});
const audioPlayer = createAudioPlayer();

let playList = [];
let indexSongInPlayList = 0;
let channelTextid = 0;

//actualizacion de comandos
(async () => {
  try {
    const rest = new REST({ version: "9" }).setToken(discordData.TOKEN);
    await rest.put(
      Routes.applicationGuildCommands(
        discordData.CLIENT_ID,
        discordData.GUILD_ID
      ),
      { body: commands }
    );
    console.log("comandos actualizados correctamente");
  } catch (error) {
    console.error(error);
  }
})();

client.on("ready", () => {
  console.log(`logeado en el servidor como ${client.user.tag}!`);
});

audioPlayer.on("error", (error) => {
  client.channels
    .fetch(channelTextid)
    .then((channel) =>
      channel.send(`error reproduciendo la cancion actual ${error}`)
    );
});

audioPlayer.on("stateChange", (oldState, newState) => {
  if (
    newState.status === AudioPlayerStatus.Idle &&
    oldState.status !== AudioPlayerStatus.Idle
  ) {
    if (playList[indexSongInPlayList]) {
      client.channels
        .fetch(channelTextid)
        .then((channel) =>
          channel.send(playSong(playList[indexSongInPlayList]))
        );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  channelTextid = interaction.channelId;

  if (!interaction.isCommand()) return;

  if (interaction.commandName === "p") {
    let songName = interaction.options.getString("param");
    let channel = interaction.member.voice.channel;

    let connectionVoiceChannel = joinVoiceChannel({
      channelId: channel.id,
      guildId: discordData.GUILD_ID,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connectionVoiceChannel.subscribe(audioPlayer);
    await interaction.reply(await SearchSong(songName));
  }

  if (interaction.commandName === "stop") {
    audioPlayer.stop();
    playList = [];
    indexSongInPlayList = 0;
    await interaction.reply(
      `Chale ${interaction.user.username} ha detenido la musica (ง'̀-'́)ง`
    );
  }

  if (interaction.commandName === "pause") {
    audioPlayer.pause();
    await interaction.reply(`uwu la cancion se encuentra en pausa`);
  }

  if (interaction.commandName === "resume") {
    audioPlayer.unpause();
    await interaction.reply(`ヽ(^o^)ノ la cancion se ha reanudado`);
  }
  if (interaction.commandName === "go") {
    let indexSong = +interaction.options.getString("index");
    if (playList[indexSong - 1])
      await interaction.reply(playSong(playList[indexSongInPlayList]));
    else
      interaction.reply("no es posible reproducir la cancion con ese indice");
  }

  if (interaction.commandName === "skip") {
    if (playList[indexSongInPlayList])
      await interaction.reply(playSong(playList[indexSongInPlayList]));
    else await interaction.reply(`no hay cancion por reproducir`);
  }

  if (interaction.commandName === "list") {
    let list = "";
    playList.map((song, i) => (list += `${i + 1}. ${song.name}`));
    await interaction.reply(list === "" ? "la lista se encuentra vacia" : list);
  }
});

const SearchSong = async (songName) => {
  let controller = "search",
    params = { key: discordData.YOUTUBE_KEY, part: "snippet" };
  if (validURL(songName)) {
    if (songName.includes("&list=")) {
      let playListId = songName
        .split("&")
        .find((item) => item.includes("list="))
        .slice(5);
      controller = "playlistItems";
      params = { ...params, playlistId: playListId, maxResults: 50 };
    } else {
    }
  } else {
    params = { ...params, q: songName, type: "video" };
  }

  let res = "";
  await axios
    .get(`https://www.googleapis.com/youtube/v3/${controller}?`, {
      params: params,
    })
    .then((response) => {
      const { status } = audioPlayer.state;
      if (!!params.playlistId) {
        response.data.items.forEach((video) => {
          playList.push({
            name: video.snippet.title,
            url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
          });
        });
        res = `Se han agregado ${response.data.pageInfo.totalResults} canciones a la lista UwU`;
      } else {
        const song = {
          name: response.data.items[0].snippet.title,
          url: `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`,
        };
        playList.push(song);
        res = `se ha agregado a la lista ${song.name}`;
      }
      if (status !== AudioPlayerStatus.Playing) {
        res = playSong(playList[0]);
      }
    })
    .catch((err) => (res = err));
  return res;
};

const playSong = (song) => {
  audioPlayer.stop();
  let stream = ytdl(song.url, { filter: "audioonly" }).on("error", (e) => {
    console.log(e);
  });

  let audioResource = createAudioResource(stream);

  audioPlayer.play(audioResource);

  indexSongInPlayList++;

  return `Reproduciendo: ${song.name} ${song.url}`;
};

const validURL = (str) => {
  var pattern = /youtube.com/i;
  return !!pattern.test(str);
};

client.login(discordData.TOKEN);
