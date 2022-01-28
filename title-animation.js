let rotate_deg = {'0':360, '1':360, '2':360, '3':360, '4':360, '5':360, '6':360};
const ROTATE_TIME = 1;
const ROTATE_INTERVAL = 8000;

function random_integer(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

function animation(){
  let number_letter = random_integer(0, 6);
  let letter = document.getElementById(`title-letter-${number_letter}`);

  let rotate = rotate_deg[String(number_letter)];
  letter.style.transition = `transform ${ROTATE_TIME}s linear`;

  if (random_integer(0, 1) === 1){
    letter.style.transform = `rotate(${rotate}deg)`;
  } else {
    letter.style.transform = `rotate3d(0, 1, 0, ${rotate}deg)`;
  }

  if (rotate === 360){
    rotate_deg[String(number_letter)] = 0;
  } else {
    rotate_deg[String(number_letter)] = 360;
  }
}

setInterval(animation, ROTATE_INTERVAL);