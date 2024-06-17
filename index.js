window.onload = function() {
    reloadAnim();
};

const reloadAnim = () => {
    const gif = document.querySelector('.main-logo');
    const imageUrl = gif.src;
    gif.src = '';
    gif.src = imageUrl;
}
