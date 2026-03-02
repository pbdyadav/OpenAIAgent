export default function TestWidget() {
  return (
    <div>
      <h1>Testing AgentHub Widget</h1>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function(w,d,s,o,f,js,fjs){
            w['AgentHub']=o;
            w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
            js=d.createElement(s);
            fjs=d.getElementsByTagName(s)[0];
            js.id=o;
            js.src=f;
            js.async=1;
            fjs.parentNode.insertBefore(js,fjs);
          }(window,document,'script','agenthub','/widget.js'));

          agenthub('init', 'digital-imalag');
        `,
        }}
      />
    </div>
  );
}
