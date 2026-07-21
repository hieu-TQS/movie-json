//
// =============================================================================
// KKPHIM PLUGIN v2.0 - TỐI ƯU
// =============================================================================
// Nguồn: https://phimapi.com
// Tối ưu cho OKMaterialTV / SmartTube
// Thay đổi: Fix getUrlYears (hardcoded fallback), filter chéo, xử lý lỗi
// =============================================================================

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "kkphim",
        "name": "KKPhim",
        "version": "2.0.0",
        "baseUrl": "https://phimapi.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/kkphim.png",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat-v3', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'subteam', title: 'Subteam', type: 'Horizontal', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi-cap-nhat-v3' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'TV shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim vietsub', slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tieng' },
        { name: 'Subteam', slug: 'subteam' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Thời gian cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' },
            { name: 'Theo ID', value: '_id' }
        ]
    });
}

// =============================================================================
// URL GENERATION - TỐI ƯU
// =============================================================================

var BASE_API = "https://phimapi.com";

var LIST_SLUGS = [
    'phim-vietsub', 'subteam', 'phim-thuyet-minh', 'phim-long-tieng',
    'phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap',
    'phim-moi-cap-nhat', 'phim-moi-cap-nhat-v3'
];

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;

        var typeList = slug;
        if (typeList === 'phim-moi') typeList = 'phim-moi-cap-nhat-v3';

        // Trường hợp đặc biệt
        if (slug === 'phim-moi-cap-nhat-v3' || typeList === 'phim-moi-cap-nhat-v3') {
            var url = BASE_API + "/danh-sach/phim-moi-cap-nhat-v3?page=" + page + "&limit=" + limit;
            if (filters.sort) url += "&sort_field=" + filters.sort;
            return url;
        }

        // Xác định basePath theo filter
        var basePath = LIST_SLUGS.indexOf(slug) !== -1 ? "danh-sach" : "the-loai";
        if (filters.year) { basePath = "nam-phat-hanh"; typeList = filters.year; }
        else if (filters.category) { basePath = "the-loai"; typeList = filters.category; }
        else if (filters.country) { basePath = "quoc-gia"; typeList = filters.country; }

        var url = BASE_API + "/v1/api/" + basePath + "/" + typeList + "?page=" + page + "&limit=" + limit;

        // Filter chéo
        if (filters.country && basePath !== "quoc-gia") url += "&country=" + filters.country;
        if (filters.year && basePath !== "nam-phat-hanh") url += "&year=" + filters.year;
        if (filters.category && basePath !== "the-loai") url += "&category=" + filters.category;
        if (filters.sort) url += "&sort_field=" + filters.sort;

        return url;
    } catch (e) {
        return BASE_API + "/v1/api/danh-sach/phim-moi-cap-nhat-v3?page=1&limit=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var limit = filters.limit || 24;
        return BASE_API + "/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&limit=" + limit;
    } catch (e) {
        return BASE_API + "/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&limit=24";
    }
}

function getUrlDetail(slug) {
    return BASE_API + "/phim/" + slug;
}

function getUrlCategories() { return BASE_API + "/the-loai"; }
function getUrlCountries() { return BASE_API + "/quoc-gia"; }

/**
 * FIX: KKPhim không có API danh sách năm riêng.
 * Trả về hardcoded years thay vì empty string gây lỗi.
 */
function getUrlYears() {
    // Trả về URL giả, parseYearsResponse sẽ xử lý hardcoded
    return BASE_API + "/nam-phat-hanh";
}

function getUrlEpisodePlayer(urlOrSlug) {
    if (urlOrSlug && (urlOrSlug.indexOf("http") === 0 || urlOrSlug.indexOf("https") === 0))
        return urlOrSlug;
    return BASE_API + "/phim/" + urlOrSlug;
}

// =============================================================================
// PARSERS - TỐI ƯU
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = data.items || [];

        if (Array.isArray(data)) items = data;
        else if (Array.isArray(response.items)) items = response.items;

        var params = data.params || {};
        var pagination = response.pagination || params.pagination || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug || "",
                title: item.name || "",
                posterUrl: getPosterUrl(item.poster_url),
                backdropUrl: getPosterUrl(item.thumb_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        });

        var totalItems = pagination.totalItems || 0;
        var itemsPerPage = pagination.totalItemsPerPage || 24;
        var totalPages = itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || {};
        var episodes = response.episodes || [];

        var servers = [];
        if (Array.isArray(episodes)) {
            episodes.forEach(function (server) {
                var serverEpisodes = [];
                if (server.server_data && Array.isArray(server.server_data)) {
                    server.server_data.forEach(function (ep) {
                        serverEpisodes.push({
                            id: ep.link_m3u8 || ep.link_embed || "",
                            name: ep.name || "",
                            slug: ep.slug || ""
                        });
                    });
                }
                if (serverEpisodes.length > 0) {
                    servers.push({ name: server.server_name || "Server", episodes: serverEpisodes });
                }
            });
        }

        var categories = (movie.category || []).map(function (c) { return c.name; }).join(", ");
        var countries = (movie.country || []).map(function (c) { return c.name; }).join(", ");
        var directors = (movie.director || []).join(", ");
        var actors = (movie.actor || []).join(", ");

        var ratingValue = 0;
        var tmdbId = "";
        var tmdbSeason = 0;
        var tmdbType = "";
        if (movie.tmdb) {
            if (movie.tmdb.vote_average) ratingValue = movie.tmdb.vote_average;
            if (movie.tmdb.id) tmdbId = String(movie.tmdb.id);
            if (movie.tmdb.season) tmdbSeason = parseInt(movie.tmdb.season, 10);
            if (movie.tmdb.type) tmdbType = movie.tmdb.type;
        }

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: getPosterUrl(movie.poster_url),
            backdropUrl: getPosterUrl(movie.thumb_url),
            description: (movie.content || "").replace(/<[^>]*>/g, ""),
            year: movie.year || 0,
            rating: ratingValue,
            quality: movie.quality || "",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            episode_total: movie.episode_total || "",
            lang: movie.lang || "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || "",
            tmdbId: tmdbId,
            tmdbSeason: tmdbSeason || 0,
            tmdbType: tmdbType || ""
        });
    } catch (error) {
        return "null";
    }
}

function parseDetailResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || {};
        var episodes = response.episodes || [];

        var streamUrl = "";
        if (episodes.length > 0) {
            var firstServer = episodes[0];
            if (firstServer.server_data && firstServer.server_data.length > 0) {
                streamUrl = firstServer.server_data[0].link_m3u8 || firstServer.server_data[0].link_embed || "";
            }
        }

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://phimapi.com"
            },
            subtitles: []
        });
    } catch (error) {
        return "{}";
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data?.items || response.items || (Array.isArray(response) ? response : []);
        return JSON.stringify(items.map(function (i) { return { name: i.name || "", slug: i.slug || "" }; }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data?.items || response.items || (Array.isArray(response) ? response : []);
        return JSON.stringify(items.map(function (i) { return { name: i.name || "", value: i.slug || "" }; }));
    } catch (e) { return "[]"; }
}

/**
 * FIX: Trả về hardcoded years vì KKPhim không có API years riêng.
 */
function parseYearsResponse(apiResponseJson) {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var y = currentYear; y >= 1970; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify(years);
}

// =============================================================================
// HELPERS
// =============================================================================

function getPosterUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0 || path.indexOf("https") === 0) return path;
    return "https://phimimg.com/" + path;
}
