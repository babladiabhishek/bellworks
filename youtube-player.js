/* Click-to-play YouTube embeds with explicit playback ownership and source credits. */
(function () {
  'use strict';
  var views = [], apiPromise;
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function thumbnail(x, size) {
    var video = window.BellworksVideos[x.slug];
    var duration = Math.floor(video.duration / 60) + ':' + String(video.duration % 60).padStart(2, '0');
    return '<img src="https://i.ytimg.com/vi/' + video.id + '/' + (size || 'mqdefault') + '.jpg" alt="" loading="lazy" decoding="async" referrerpolicy="strict-origin-when-cross-origin"><span class="video-duration" aria-hidden="true">' + duration + '</span>';
  }
  function loadAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (!apiPromise) apiPromise = new Promise(function(resolve) {
      var timer = setTimeout(function() { resolve(null); }, 10000);
      window.onYouTubeIframeAPIReady = function() { clearTimeout(timer); resolve(window.YT); };
      var script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
      script.onerror = function() { clearTimeout(timer); resolve(null); };
      document.head.appendChild(script);
    });
    return apiPromise;
  }
  function stopAll() { views.forEach(function(view) { view.stop(); }); }
  function create(container, icon) {
    var view = {player:null, frame:null, generation:0, timer:null};
    view.stop = function() {
      view.generation++;
      clearTimeout(view.timer);
      if (view.player) { try { view.player.destroy(); } catch(e) {} view.player = null; }
      if (view.frame) { view.frame.remove(); view.frame = null; }
      var poster = container.querySelector('.video-poster');
      if (poster) { poster.hidden = false; poster.disabled = false; }
      var status = container.querySelector('.video-status');
      if (status) { status.textContent = ''; status.hidden = true; }
    };
    view.select = function(x) {
      view.stop(); view.exercise = x;
      var video = window.BellworksVideos[x.slug];
      container.dataset.videoId = video.id;
      container.innerHTML =
        '<div class="video-stage"><button type="button" class="video-poster" aria-label="Play ' + escapeHTML(x.name) + ' tutorial by ' + escapeHTML(video.channel) + '">' +
        thumbnail(x, 'hqdefault') + '<span class="video-play-disc">' + icon('play') + '</span>' +
        '<span class="video-poster-caption"><span>LEARN THE MOVEMENT</span><strong>Watch the demonstration</strong></span></button></div>' +
        '<div class="video-credit"><span class="youtube-mark">' + icon('play') + '</span><div><span>DEMONSTRATED BY</span><a class="video-channel" target="_blank" rel="noopener noreferrer" href="' + video.channelUrl + '">' + escapeHTML(video.channel) + '</a></div>' +
        '<a class="video-external" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=' + video.id + (video.start ? '&amp;t=' + video.start : '') + '" aria-label="Watch ' + escapeHTML(x.name) + ' on YouTube">YouTube ' + icon('arrow-up-right') + '</a></div>' +
        '<p class="video-status" role="status" hidden></p>';
      container.querySelector('.video-poster').addEventListener('click', view.play);
    };
    view.play = function() {
      stopAll();
      var video = window.BellworksVideos[view.exercise.slug], generation = view.generation;
      var status = container.querySelector('.video-status');
      function message(text) { if (generation !== view.generation) return; status.textContent = text; status.hidden = !text; }
      message('Loading your tutorial…');
      container.querySelector('.video-poster').disabled = true;
      loadAPI().then(function(api) {
        if (generation !== view.generation) return;
        var frame = document.createElement('iframe');
        var query = new URLSearchParams({autoplay:'1', playsinline:'1', rel:'0', enablejsapi:'1', hl:'en'});
        if (video.start) query.set('start', video.start);
        if (/^https?:$/.test(location.protocol)) query.set('origin', location.origin);
        frame.src = 'https://www.youtube-nocookie.com/embed/' + video.id + '?' + query;
        frame.title = view.exercise.name + ' — ' + video.channel + ' YouTube tutorial';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
        frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
        view.frame = frame;
        message('Loading your tutorial…');
        frame.addEventListener('load', function() { if (generation !== view.generation) return; clearTimeout(view.timer); message(''); });
        frame.addEventListener('error', function() { message('YouTube couldn’t load here. Use the YouTube link above to open this tutorial.'); });
        view.timer = setTimeout(function() { message('Taking longer to load? Open this tutorial using the YouTube link above.'); }, 12000);
        container.querySelector('.video-stage').appendChild(frame);
        container.querySelector('.video-poster').hidden = true;
        frame.focus({preventScroll:true});
        if (!api) { apiPromise = null; return; }
        view.player = new api.Player(frame, {events:{
          onReady:function() { if (generation !== view.generation) return; clearTimeout(view.timer); message(''); },
          onError:function() { if (generation !== view.generation) return; clearTimeout(view.timer); message('This tutorial can’t play here. Use the YouTube link above to watch it.'); },
          onAutoplayBlocked:function() { message('Press play in the YouTube player to start your tutorial.'); },
          onStateChange:function(event) { if (generation === view.generation && event.data === 1) { message(''); views.forEach(function(other) { if (other !== view) other.stop(); }); } }
        }});
      });
    };
    views.push(view); return view;
  }
  window.BellworksVideo = {create:create, thumbnail:thumbnail, stopAll:stopAll};
  window.addEventListener('pagehide', stopAll);
})();
