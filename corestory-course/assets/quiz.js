/* Shared quiz widget for CoreStory lessons.
   Usage: wrap options in <div class="quiz"> with buttons of class "opt".
   The correct answer is the button with data-correct="true".
   Each quiz has a <div class="feedback"> element that receives the verdict.
   One answer per quiz (multiple-choice). Options auto-numbered.
   Prints cleanly. */
(function () {
  function initQuiz(quiz) {
    var qText = quiz.querySelector(".q");
    var opts = quiz.querySelectorAll(".opt");
    var feedback = quiz.querySelector(".feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "feedback";
      quiz.appendChild(feedback);
    }
    var answered = false;
    for (var i = 0; i < opts.length; i++) {
      (function (opt, idx) {
        opt.dataset.idx = idx;
        opt.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          var correct = opt.getAttribute("data-correct") === "true";
          for (var j = 0; j < opts.length; j++) {
            opts[j].disabled = true;
            if (opts[j].getAttribute("data-correct") === "true") {
              opts[j].classList.add("correct");
            }
            if (opts[j] === opt && !correct) {
              opts[j].classList.add("wrong");
            }
          }
          feedback.classList.add("show");
          if (correct) {
            feedback.classList.add("ok");
            feedback.innerHTML =
              '<span class="verdict">回答正确 ✓</span> — 很好，你已经掌握了这一要点。';
          } else {
            feedback.classList.add("no");
            feedback.innerHTML =
              '<span class="verdict">回答错误 ✗</span> — 温习上面的内容后再试一次（本测验只计一次结果）。';
          }
        });
      })(opts[i], i);
    }
  }
  function init() {
    var quizzes = document.querySelectorAll(".quiz");
    for (var i = 0; i < quizzes.length; i++) initQuiz(quizzes[i]);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
