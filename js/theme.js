/* Daybreak: picks light or dark before the page paints.
   Follows the phone or computer setting (System) until the user picks Light or Dark in the Function tab. */
(function(){
  var KEY='daybreak.planner.v1', mq=window.matchMedia('(prefers-color-scheme: dark)');
  function wanted(){
    try{
      var s=JSON.parse(localStorage.getItem(KEY)||'null'), st=s&&s.settings;
      if(st&&st.themeSet&&(st.theme==='light'||st.theme==='dark')) return st.theme;
    }catch(e){}
    return 'system';
  }
  function apply(){
    var t=wanted(), dark=t==='dark'||(t==='system'&&mq.matches), root=document.documentElement;
    root.setAttribute('data-mode',dark?'dark':'light');
    root.style.colorScheme=dark?'dark':'light';
    var m=document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content',dark?'#0B111F':'#F2F4F9');
  }
  apply();
  if(mq.addEventListener) mq.addEventListener('change',function(){ if(wanted()==='system') apply(); });
  window.addEventListener('storage',function(e){ if(e.key===KEY) apply(); });
})();
