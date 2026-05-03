const code = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='light'||s==='dark')?s:(m?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export function ThemeInit() {
  return (
    <div
      hidden
      dangerouslySetInnerHTML={{ __html: `<script>${code}</script>` }}
    />
  );
}
