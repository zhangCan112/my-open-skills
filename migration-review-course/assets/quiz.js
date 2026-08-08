// Shared quiz widget for lessons.
// Usage: <div class="quiz" data-correct="2"> <p class="q">…</p>
//          <button data-i="0">A</button> <button data-i="1">B</button> <button data-i="2">C</button>
//          <div class="reveal">explanation</div> </div>
// The widget marks the chosen button; correct = data-correct index.
(function(){
  function init(){
    document.querySelectorAll('.quiz').forEach(function(q){
      var correct = parseInt(q.getAttribute('data-correct'),10);
      q.querySelectorAll('button').forEach(function(btn){
        btn.addEventListener('click', function(){
          var i = parseInt(btn.getAttribute('data-i'),10);
          q.querySelectorAll('button').forEach(function(b){ b.classList.remove('correct','wrong'); });
          if(i===correct){ btn.classList.add('correct'); q.classList.add('revealed'); }
          else{ btn.classList.add('wrong'); q.classList.remove('revealed'); }
        });
      });
    });
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
  else{ init(); }
})();