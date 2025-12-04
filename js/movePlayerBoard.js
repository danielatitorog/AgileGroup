let position = 0;
const ageButton = document.getElementById("ageButton");
const player = document.querySelector(".player-container");
const steps = document.querySelectorAll("#board .step-circle");
const boardParent = document.getElementById("board").parentElement;


function movePlayerTo(index) {
    const target = steps[index];

    const rectParent = boardParent.getBoundingClientRect();
    const rectTarget = target.getBoundingClientRect();
    const playerWidth = player.offsetWidth;
    const playerHeight = player.offsetHeight;

    // Horizontal offset: center on the dot
    const offsetX = rectTarget.left - rectParent.left + rectTarget.width / 2 - playerWidth / 2;

    // Vertical offset: always 25px above the dot
    const offsetY = rectTarget.top - rectParent.top - playerHeight - 15;

    // Animate fade out / move / fade in
    player.classList.add("fading");
    setTimeout(() => {
        player.style.left = offsetX + "px";
        player.style.top = offsetY + "px";

        setTimeout(() => {
            player.classList.remove("fading");
        }, 300);
    }, 300);
}

document.getElementById("ageButton").addEventListener("click", () => {
    if (position < steps.length - 1) {
        position++;
        movePlayerTo(position);

        // 25% chance for event
        const chance = Math.random();
        if (chance < 0.25) {
            const eventModalEl = document.getElementById('eventModal');
            const eventModal = new bootstrap.Modal(eventModalEl);

            // Disable the button
            ageButton.disabled = true;

            // Show modal
            eventModal.show();

            // Re-enable the button when modal is hidden
            eventModalEl.addEventListener('hidden.bs.modal', () => {
                ageButton.disabled = false;
            }, { once: true });
        }
    }
});



window.addEventListener('DOMContentLoaded', () => {

    const infoModalEl = document.getElementById('infoModal');
    const infoModal = new bootstrap.Modal(infoModalEl);

    // Show the modal
    infoModal.show();

    movePlayerTo(0);
});
