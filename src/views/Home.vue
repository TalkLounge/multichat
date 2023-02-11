<template>
  <main class="d-flex flex-row">
    <div class="flex-fill ms-2 me-2" v-for="chat in this.chats" :key="chat.iframe">
      <div class="header pt-2">
        <div class="m-auto w-mc mb-3">
          <img :src="chat.provider + '.png'" class="header-img d-inline">
          <h2 class="align-bottom d-inline ms-2">
            {{ chat.provider == "youtube" ? "YouTube" : chat.provider.charAt(0).toUpperCase() + chat.provider.slice(1) }}
          </h2>
        </div>
        <div class="d-flex justify-content-center align-items-center">
          <a :href="chat.stream" target="_blank" class="m-1" title="Open Stream in New Tab">
            <button class="btn btn-danger button-space">
              <i class="bi-play-btn"></i>
            </button>
          </a>
          <a :href="chat.chat" target="_blank" class="m-1" title="Open Chat in New Tab">
            <button class="btn btn-success">
              <i class="bi-chat"></i>
            </button>
          </a>
          <a v-if="dashboard" :href="chat.dashboard" target="_blank" class="m-1" title="Open Stream Dashboard in New Tab">
            <button class="btn btn-info">
              <i class="bi-bar-chart"></i>
            </button>
          </a>
        </div>
      </div>
      <iframe v-if="chat.iframe" :src="chat.iframe"></iframe>
      <div v-else-if="chat.error" class="loader d-flex justify-content-center align-items-center">
        An error occurred while loading the chat
      </div>
      <div v-else-if="chat.nostream" class="loader d-flex justify-content-center align-items-center">
        No Chat found. Is your Stream public?
      </div>
      <div v-else class="loader d-flex justify-content-center align-items-center">
        <div class="spinner-grow"></div>
      </div>
    </div>
  </main>
</template>

<style>
body {
  overflow-y: hidden;
}

.header {
  height: 14vh;
}

.w-mc {
  width: max-content;
}

.header-img {
  height: 4vh;
}

iframe, .loader {
  height: 86vh;
  width: 100%;
}
</style>

<script>
export default {
  name: "Home",
  data() {
    return {
      chats: [],
      dashboard: true
    }
  },
  async mounted() {
    const params = this.$route.params.pathMatch.split("+");

    // Match Chats from URL
    for (let i = 0; i < params.length; i++) {
      let param = params[i].split(":");

      if (param[0] == "disable-dashboard") {
        this.dashboard = false;
      }

      param[0] = this.matchProvider(param[0]);
      if (param[0]) {
        this.chats.push({provider: param[0], channel: param[1]});
      }
    }

    // Initialize Chat URLs
    for (let i = 0; i < this.chats.length; i++) {
      let item = this.chats[i];

      switch (item.provider) {
        case "youtube":
          const videoId = await this.getYouTubeVideoIdByChannelId(item.channel);

          if (videoId == false) {
            item.error = true;
          } else if (! videoId) {
            item.nostream = true;
          } else if (videoId) {
            item.iframe = `https://www.youtube.com/live_chat?is_popout=1&v=${videoId}&embed_domain=${window.location.hostname}`;
            item.chat = `https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`;
            item.stream = `https://www.youtube.com/watch?v=${videoId}`;
            item.dashboard = `https://studio.youtube.com/video/${videoId}/livestreaming`;
          }

          break;
        case "twitch":
          item.iframe = `https://www.twitch.tv/embed/${item.channel}/chat?parent=${window.location.hostname}`;
          item.chat = `https://www.twitch.tv/popout/${item.channel}/chat?popout=`;
          item.stream = `https://www.twitch.tv/${item.channel}`;
          item.dashboard = `https://dashboard.twitch.tv/u/${item.channel}/stream-manager`;

          break;
        case "kick":
          item.iframe = `https://kick.com/${item.channel}/chatroom`;
          item.chat = `https://kick.com/${item.channel}/chatroom`;
          item.stream = `https://kick.com/${item.channel}`;
          item.dashboard = "https://kick.com/dashboard/stream";

          break;
        case "trovo":
          item.iframe = `https://trovo.live/chat/${item.channel}`;
          item.chat = `https://trovo.live/chat/${item.channel}`;
          item.stream = `https://trovo.live/s/${item.channel}`;
          item.dashboard = "https://studio.trovo.live/stream";

          break;
      }
    }
  },
  methods: {
    matchProvider(provider) {
      provider = provider.toLowerCase();
      provider = provider.replace("yt", "youtube");
      provider = provider.replace("yutube", "youtube");
      provider = provider.replace("ttv", "twitch");
      provider = provider.replace("youtube.com", "youtube");
      provider = provider.replace("yutube.com", "youtube");
      provider = provider.replace("youtube.de", "youtube");
      provider = provider.replace("yutube.de", "youtube");
      provider = provider.replace("twitch.tv", "twitch");
      provider = provider.replace("kick.com", "kick");
      provider = provider.replace("trovo.live", "trovo");

      if (["youtube", "twitch", "kick", "trovo"].includes(provider)) {
        return provider;
      }
    },
    parseYouTubeVideoIdByUrl(url) { // Thanks to: https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url#answer-54200105
      url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
    },
    async getYouTubeVideoIdByChannelId(channelId) {
      const proxys = [
        {
          url: "https://cors-get-proxy.sirjosh.workers.dev/?url=%s"
        }, {
          url: "https://proxy.cors.sh/%s",
          headers: {"origin": window.location.hostname}
        }, {
          url: "https://cors.eu.org/%s"
        }, {
          url: "https://corsanywhere.herokuapp.com/%s",
          headers: {"origin": window.location.hostname}
      }];

      let data;
      for (let i = 0; i < proxys.length; i++) { // Try different Cors Proxies
        console.log(proxys[i].url);
        data = await this.$axios.get(proxys[i].url.replace("%s", `https://www.youtube.com/embed/live_stream?channel=${channelId}`), proxys[i].headers);
        if (data.status == 200) {
          data = data.data;
          break;
        }
      }

      // Return when all Proxies are down
      if (data.status) {
        return false;
      }

      const $ = this.$cheerio.load(data);
      const url = $("link[rel=canonical]").prop("href");
      // No Livestream found
      if (! url) {
        return;
      }

      return this.parseYouTubeVideoIdByUrl(url);
    },
  }
}
</script>