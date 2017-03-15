# Longread Template
HTML-Template für schöne Longread- und Storytelling-Projekte außerhalb von Sophora. Ein Projekt von [BR Data](http://br.de/data).

- **Live**: http://web.br.de/interaktiv/angriff-auf-die-demokratie
- **Redirect**: http://daserste.de/angriff-auf-die-demokratie

## Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Projekt bauen mit `npm run-script dist` oder `grunt dist`
4. Website über Apache oder einen ähnlichen HTTP-Server ausliefern

## Daten

## Elemente
Die Website baut auf dem [BR Data Longread Template](https://github.com/digitalegarage/longread-template) auf. Eine detailierte Dokumentation der Standard-Elemente findet sich dort. Die hier dokumentierten Elemente sind projektspezifisch:

## Entwickeln
Das Longread-Template ist eine Web-Anwendung basierend auf HTML, Sass und JavaScript. Als Paketmanager kommt NPM zum Einsatz. Alle anderen Abhänigkeiten, wie Grunt und PostCSS, dienen nur dazu, einen optimierten Build zu erstellen.

### Enwicklungsserver
Zum lokalen Entwickeln ist ein kleiner [HTTP-Server](https://github.com/indexzero/http-server) integriert. Diesen kann man mit dem Befehl `npm start` starten. Der Server läuft unter http://localhost:8080. Beim Starten des Entwicklungsservers sollte automatisch ein neues Browserfenster aufgehen. 

### Stylesheets
Die Stylesheets sind modular in [Sass](http://Sass-lang.com/) angelegt:
- **custom**: projektspezifische Stylesheets 
- **layout**: allgemeine Layout-Komponenten (Typo, Farben, Grid ...) 
- **modules**: komponentenspezifische Komponenten (Navigation, Footer, Zitate ...)

Um die Sass-Styles bei jeder Änderungen neu zu kompilieren, kann man den Sass-Watcher laufen lassen `npm run-script watch` oder `grunt watch`. Als Kompiler kommt [LibSass](http://Sass-lang.com/libSass) zum Einsatz, welches deutlich schneller ist als der alte Ruby-Sass-Kompiler. 

*Hinweis*: Vendor-Prefixes können weggelassen werden, das diese im Grunt-Build-Task automatisch hinzugefügt werden.

### Javascript
Das Javascript is ebenfalls modular aufgebaut. Es gibt einen zentralen Einstiegspunkt `init.js`, wo alle Module initialisiert werden. Auch globale Event Listener auf das window oder document-Objekt sollten hier registriert werden.

Die Module haben folgen dem [Revealing Module Pattern](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#revealingmodulepatternjavascript) und haben folgenden Aufbau: 

```javascript
var module = (function () {

  'use strict';

  function init() {

    doSomething();
  }

  function doSomething() {

    // Do something
  }

  // Export global functions
  return {
    init: init,
  };
})();
```

In der `init.js` würde man das Modul folgendermaßen aufrufen:

```javascript
module.init()
```

Alle Module sind in Vanilla-Javascript (ohne andere Bibliotheken) geschrieben. Sollte man eine externe Bibliothek benötigen, kann man diese mit Bower installieren:

```
bower install d3 --save
```

### Grunt (Build Task)
Mithilfe des Taskrunners Grunt kann eine optimierte Version der Seite gebaut werden. Dabei wird:
- JavaScript wird minifiziert und in eine Datei zusammengefasst (uglify)
- Stylesheet werden geprefixt, minifiziert und zusammengefasst (PostCSS)
- HTML-Script und Style-Tags werden angepasst (Usemin)
- Bilder und Daten werden kopiert (copy)

Ausführen den Grunt Tasks:
- Erforderliche Module installieren `npm install`
- Task ausführen mit `npm run-script dist` oder `grunt dist`

Die optimierte Version des Webseite liegt nach Ausführen des Grunt Tasks unter `dist`. Sollten neue Bibliotheken hinzugefügt werden, müssen diese auch im Gruntfile hinzugefügt werden:

```javascript
uglify: {

  dist: {

    files: {

      'dist/scripts/main.min.js': [
        'node_modules/d3/d3.min.js', // Neue Bibliothek
        'src/scripts/classList.js',
        'src/scripts/navigation.js',
        'src/scripts/marginals.js',
        'src/scripts/intro.js',
        'src/scripts/highlights.js',
        'src/scripts/comparison.js',
        'src/scripts/ranking.js',
        'src/scripts/init.js'
      ]
    }
  }
}
```

Externe Stylesheet importiert man jedoch besser in einem Sass-Modul:

```Sass
@import url(http://web.br.de/interaktiv/assets/libraries/leaflet/leaflet.v0.min.css)
```

## Verbesserungen
