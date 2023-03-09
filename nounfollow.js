const ignoreRoutes = [
    '/account/*',
    '/directory/*',
    '/admin/*',
    '/settings/*',
    '/user/*',
    '/u/*',
    '/',
];

let tries = 0;
let lastRoute = null;
const maxAttemps = 10;
const watchForRouteInterval = 1000;
const searchForIconInterval = 1000;

async function searchForIcon() {
    const shouldIgnoreRoute = await ignoreRoute();
    if (shouldIgnoreRoute) {
        logWarn(`Route is ignored, stopping...`);
        return;
    }

    const unfollowbtn = getUnfollowBtn();
    const followBtn = getFollowBtn();

    if (followBtn) {
        logInfo(`Follow button found, stopping...`);
        return;
    }

    if (unfollowbtn) {
        logInfo(`Icon found, removing...`);
        removeIcon(unfollowbtn);
    } else {
        if (tries > maxAttemps) {
            logError(`Icon not found, stopping...`);
            return;
        }

        if (isAlreadyRemoved()) {
            logInfo(`Icon already removed, stopping...`);
            return;
        }

        logError(`Icon not found, retrying in 1 second...`);
        setTimeout(() => {
            tries++;
            searchForIcon();
        }, searchForIconInterval);
    }
}

function removeIcon(btn) {
    const unfollowBtnParent = btn.parentElement;

    setTimeout(() => {
        btn.remove();
        createEmptyPlaceholderDiv(unfollowBtnParent);
    }, 500);
}

function getUnfollowBtn() {
    return document.querySelector('button[data-a-target="unfollow-button"]');
}

function getFollowBtn() {
    return document.querySelector('button[data-a-target="follow-button"]');
}

function isAlreadyRemoved() {
    return document.querySelector('div[data-a-target="unfollow-button-placeholder"]');
}

function createEmptyPlaceholderDiv(parentDiv) {
    const emptyDiv = document.createElement('div');
    emptyDiv.setAttribute('data-a-target', 'unfollow-button-placeholder');
    emptyDiv.style.width = '40px';
    emptyDiv.style.height = '0';
    emptyDiv.style.display = 'inline-block';
    parentDiv.appendChild(emptyDiv);
}

function watchForRouteChange() {
    const currentRoute = window.location.pathname;
    if (!lastRoute) {
        lastRoute = currentRoute;
    }

    if (currentRoute === lastRoute) {
        return;
    }

    lastRoute = currentRoute;

    logInfo(`Route changed, searching for icon...`);
    searchForIcon();
}

async function init() {
    logInfo(`Twitch Unfollow Icon Remover is running...`);
    searchForIcon();
    setInterval(watchForRouteChange, watchForRouteInterval);
}

async function ignoreRoute() {
    const currentRoute = window.location.pathname;

    for (let i in ignoreRoutes) {
        const route = ignoreRoutes[i];

        const isWildcard = route.endsWith('*');
        if (isWildcard) {
            const routeWithoutWildcard = route.replace('*', '');
            if (currentRoute.startsWith(routeWithoutWildcard)) {
                return true;
            }
        } else {
            if (currentRoute === route) {
                return true;
            }
        }
    }

    return false;
}

function logError(e) {
    console.error('%c[TNUF] %c[ERROR]', 'color: blue', 'color: red', e);
}

function logInfo(i) {
    console.info('%c[TNUF] %c[INFO]', 'color: blue', 'color: green', i);
}

function logWarn(w) {
    console.warn('%c[TNUF] %c[INFO]', 'color: blue', 'color: orange', w);
}

setTimeout(() => {
    init().catch((e) => logError(e));
}, 3000);
