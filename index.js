//Class for Seasons with attributes for id, name, and an array for anime
class Season {
    constructor(name) {
        this.name = name;
        this.animes = [];
    }

    // Method allows adding anime to animes array in seasons
    addAnime(title, studio) {
        this.animes.push(new Anime(title, studio));
    }
}

//Creating a class for anime with title and studio attributes
class Anime {
    constructor(title, studio) {
        this.title = title;
        this.studio = studio;
    }
}

class Tracker {
    static url = 'https://662d79eaa7dda1fa378ab089.mockapi.io/TestAPI/seasons';
    
    static getAllSeasons() {
        return $.get(this.url);
    }

    static getSeason(id) {
        return $.get(this.url + `/${id}}`);
    }

    static createSeason(season) {
        return $.post(this.url, season);
    }

    static updateSeason(season) {
        return $.ajax({
            url: this.url + `/${season.id}`,
            dataType: 'json',
            data: JSON.stringify(season),
            contentType: 'application/JSON',
            type: 'PUT'
        });
    }

    static deleteSeason(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE',
        });
    }
}

class DOMManager {
    static seasons;

    static getAllSeasons() {
        Tracker.getAllSeasons().then(seasons => this.render(seasons));
    }

    static createSeason(name) {
        Tracker.createSeason(new Season(name))
            .then(() => {
                return Tracker.getAllSeasons();
            })
            .then((seasons) => this.render(seasons));
    }

    static deleteSeason(id) {
        Tracker.deleteSeason(id)
        .then(() => {
            return Tracker.getAllSeasons();
        })
        .then((seasons) => this.render(seasons));
    }

    static addAnime(id) {
        for (let season of this.seasons) {
            if (season.id == id) {
                season.animes.push(new Anime($(`#${season.id}-anime-title`).val(), $(`#${season.id}-anime-studio`).val()));
                season.animes.forEach((anime, index) => {
                    anime.id = index;                   
                }) ;
                Tracker.updateSeason(season)
                    .then(() => {
                        return Tracker.getAllSeasons();
                    })
                    .then((seasons) => this.render(seasons));
            }
        }
    }

    static deleteAnime(seasonId, animeId) {
        for (let season of this.seasons) {
            if (season.id == seasonId) {
                for (let anime of season.animes) {
                    if (anime.title == animeId) {
                        season.animes.splice(season.animes.indexOf(anime), 1);
                        Tracker.updateSeason(season)
                            .then(() => {
                                return Tracker.getAllSeasons();
                            })
                            .then((seasons) => this.render(seasons));
                    }
                }
            }
        }
    }

    static render(seasons) {
        this.seasons = seasons;
        $('#app').empty();
        for (let season of seasons) {
            $('#app').prepend(
                `<div id="${season.id}" class="card border border-success">
                    <div class="card-header text-bg-success">
                        <h2>${season.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteSeason('${season.id}')">DELETE</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="input-group mb-3">
                                <span class="input-group-text">Anime Title</span>
                                <input type="text" class="form-control" id="${season.id}-anime-title">
                                <span class="input-group-text">Anime Studio</span>
                                <input type="text" class="form-control" id="${season.id}-anime-studio">
                            </div>
                            <button id="${season.id}-new-anime" onclick="DOMManager.addAnime('${season.id}')" class="btn btn-outline-success form-control">Add Anime</button>
                        </div>
                    </div>
                </div>
                <br>
                `
            );

            for (let anime of season.animes) {
                $(`#${season.id}`).find('.card-body').append(
                    `<p>
                    <span id="title-${anime.title}"><strong>Title: </strong> ${anime.title}</span>
                    <span id="studio-${anime.studio}"><strong>Studio: </strong> ${anime.studio}</span>
                    <button class="btn btn-danger btn-sm" onclick="DOMManager.deleteAnime('${season.id}', '${anime.title}')">DELETE ANIME</button>`
                )
            }
        }
    }
}

$('#add-new-season').click(() => {
    DOMManager.createSeason($('#new-anime-season').val());
    $('#new-anime-season').val('');
});

DOMManager.getAllSeasons();