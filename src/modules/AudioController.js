export function initAudio(analytics) {
    // ── Music Pill Rotation ──
    const songs = [
        { title: "Sing about me, im dying of thirst", artist: "Kendrick Lamar", art: "/kendrick.png" },
        { title: "Poor thang.", artist: "J. Cole", art: "/jcole.png" },
        { title: "lost souls", artist: "Baby Keem", art: "/babykeem.jpg" }
    ];

    let currentSongIndex = 0;
    const musicArt = document.getElementById('music-art');
    const musicTitle = document.getElementById('music-title');
    const musicArtist = document.getElementById('music-artist');
    const musicPill = document.querySelector('.music-pill');

    function rotateSong() {
        if (!musicPill || !musicArt || !musicTitle || !musicArtist) return;
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        const song = songs[currentSongIndex];
        musicPill.style.opacity = '0';
        musicPill.style.transform = 'translateY(5px)';
        setTimeout(() => {
            musicArt.src = song.art;
            musicTitle.textContent = song.title;
            musicArtist.textContent = song.artist;
            musicPill.style.opacity = '1';
            musicPill.style.transform = 'translateY(0)';
        }, 400);
    }

    if (musicPill) {
        setInterval(rotateSong, 45000);
        musicPill.addEventListener('click', () => {
            if (analytics) analytics.track('Clicked Music Pill', { current_song: songs[currentSongIndex].title });
        });
    }
}
