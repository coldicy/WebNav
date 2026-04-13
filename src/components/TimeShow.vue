<template>
  <div id="time-show">
    <div class="time">12:00</div>
    <div class="day">
      <div class="day-day">2026-03-30</div>
      <div class="day-week">星期一</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
//用于刷新时间的setInterval的定时器id
let timerIdShowTime
onMounted(() => {
  const timeElement = document.getElementsByClassName('time').item(0);
  const day_dayElement = document.getElementsByClassName('day-day').item(0);
  const day_weekElement = document.getElementsByClassName('day-week').item(0);
  let date, hour, minute, second;
  let weekDay, year, month, day;
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  //设置并刷新页面显示的时间和日期
  function showTime() {
    date = new Date()
    //时间
    hour = date.getHours()
    minute = date.getMinutes()
    second = date.getSeconds()
    //日期
    year = date.getFullYear()
    month = date.getMonth() + 1
    day = date.getDate()
    //星期数
    weekDay = weekDays[date.getDay()]

    const padDate = (num) => {
      return num.toString().padStart(2, '0')
    }

    let timeStr = hour.toString().padStart(2, '0') + ':' +
      minute.toString().padStart(2, '0') + ':' +
      second.toString().padStart(2, '0');

    let dateStr = padDate(year) + '-' +
      padDate(month) + '-' + padDate(day);

    timeElement.innerHTML = timeStr
    day_dayElement.innerHTML = dateStr
    day_weekElement.innerHTML = weekDay
  }

  //在定时器还没运行前，先执行一次，不至于出现空档期
  showTime()
  timerIdShowTime = setInterval(() => {
    showTime()
  }, 1000)
})

onUnmounted(() => {
  if (timerIdShowTime) {
    clearInterval(timerIdShowTime)
    console.log('timerIdShowTime 定时器已经清除')
    timerIdShowTime = null //置空以防误用
  }
})

</script>

<style scoped>
#time-show {
  position: relative;
  left: 10px;
  display: flex;
  align-items: start;
  flex-direction: column;
  width: 160px;
}
.time {
  font-size: 2em;
  font-weight: bold;

  color: aliceblue;
}
.day {
  display: flex;
  gap: 0.5em;
  flex-direction: row;
  align-items: center;

  font-size: 0.8em;
  color: aliceblue;
}
.day_day {

}

.day_week {}
</style>