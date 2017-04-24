# Draw it! Merkel nach Zahlen
Arbeitslose, Kernkraftwerke, Bundeswehr: Wie hat sich Deutschland unter Angela Merkels Kanzlerschaft verändert? Zeichnen Sie das Diagramm und schätzen Sie die Werte. Eine interaktive Anwendung von [BR Data](http://br.de/data).

- **Live**: http://web.br.de/interaktiv/merkel-nach-zahlen/
- **Redirect**: http://br.de/merkelnachzahlen/

## Verwendung
1. Repository klonen `git clone https://...`
2. Erforderliche Module installieren `npm install`
3. Projekt bauen mit `npm run-script dist` oder `grunt dist`
4. Website über Apache oder einen ähnlichen HTTP-Server ausliefern

## Elemente
Die Website baut auf dem [BR Data Longread Template](https://github.com/digitalegarage/longread-template) auf. Eine detailierte Dokumentation der Standard-Elemente findet sich dort. Die hier dokumentierten Elemente sind projektspezifisch:

### Draw it!
Lässt den Benutzer den Linienverlaufs eines Diagramms zeichnen und zeigt dann den richtigen Linienverlauf. Die Daten dafür sind sind in `data/data.json` hinterlegt. Hier das Beispiel für ein Diagramm:

```javascript
[{
  "id": "arbeitslosenquote",
  "unit": "%", // Einheit (€, Äpfel, tausend Tonnen)
  "factor": 1, // Multiplikator für die Werte (z.B. 1000 bei tausend Tonnen)
  "max": 20, // Maximaler y-Wert für die relative Höhe des Diagramms
  "precision": 10, // 2 Nachkommastellen
  "breakpoint": 2005, // Ab wann soll der Benutzer schätzen können
  "values": [
    { "year": 2002, "value": 9.8},
    { "year": 2003, "value": 10.5},
    { "year": 2004, "value": 10.5 },
    { "year": 2005, "value": 11.7 },
    { "year": 2006, "value": 10.8 },
    { "year": 2007, "value": 9.0},
    { "year": 2008, "value": 7.8},
    { "year": 2009, "value": 8.1},
    { "year": 2010, "value": 7.7},
    { "year": 2011, "value": 7.1},
    { "year": 2012, "value": 6.8},
    { "year": 2013, "value": 6.9},
    { "year": 2014, "value": 6.7},
    { "year": 2015, "value": 6.4},
    { "year": 2016, "value": 6.1}
  ],
  "annotations": [ // Eine oder mehrere Anmerkungen
    {
      "text": "Finanzkrise",
      "color": "#000",
      "year": 2009,
      "value": 8.1
    }
  ]
}]
```

Um das Diagramm zeichnen zu können, braucht es einen Container für das Diagramm (SVG), optional einen Auflösungstext (`p`) und Bedienelemente (`button`). Alle Elemente eines Draw Its sind mit der selben `data-id` versehen. So weiß die Awendung, welche Elemente zusammen gehören. Beispiel:

```html
<h2>Schätzen Sie: Unter Angela Merkel ist die Arbeitslosenquote …</h2>
<div class="draw" data-id="arbeitslosenquote"></div>

<button class="show" data-id="arbeitslosenquote">Ergebnis anzeigen</button>
<button class="reset" data-id="arbeitslosenquote"><i class="icon-ccw"></i></button>

<p style="opacity:0;" data-id="arbeitslosenquote">… <strong>deutlich gesunken</strong>. Zwar wurde die gute Entwicklung in den Krisenjahren etwas gedämpft, doch liegt die Quote heute auf dem niedrigsten Stand seit der Wiedervereinigung. Die Armut in Deutschland ist trotzdem nicht besiegt.</p>
```

Um ein neues Draw It zu erzeugen muss man eine neue Instanz von `draw` – mit den Daten (JSON) und der ID des Datensatzes – erzeugen und aufrufen

```javascript
var newDrawIt = new draw({
  id: 'arbeitslosenquote', // data-id der Elemente und ID des Objects im JSON-Array
  element: document.getElementById('#arbeitslosenquote)', // optional: das Container-Element
  data: data // JSON mit (allen) Daten
});

newDrawIt.init()
```

Die Draw it-Instanz `newDrawIt` exportiert folgende Methoden:
- **init**: Starten des Draw its.
- **render**: Neuzeichnen des Draw its, z.B. wenn sich die Bildschirmbreite ändert.
- **update**: Update des Draw its, z.B. wenn sich Werte geändert haben.
- **reset**: Setzt das Draw it auf den Ausgangszustand zurück.

Viele Einstellungsmöglichkeiten finden sich direkt in der Datei `scripts/custom/draw.js`. So zum Beispiel die Koalitionen (farbige Punkte an der x-Achse) und die Beschriftungen der Regierungsperioden.

## Daten

- [Arbeitslosenquote: Bundesagentur für Arbeit](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=1704827277?usp=sharing)
- [Kinder in Bedarfsgemeinschaften: Bundesagentur für Arbeit](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=1127927075?usp=sharing)
- [Vermögen der reichsten Deutschen: Forbes (Schätzung)](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=73623855?usp=sharing)
- [Staatsverschuldung: Statistisches Bundesamt](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=1363047983?usp=sharing)
- [Soldaten im Ausland: Bundeswehr](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=1843252562?usp=sharing)
- [Abschiebungen: Bundespolizei](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=1098998086?usp=sharing)
- [Kernkraftwerke: Bundesamt für kerntechnische Entsorgung](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=922643127?usp=sharing)
- [Treibhausgas-Emissionen: Umweltbundesamt](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=1377300261?usp=sharing)
- [Betreuungsquote: 2002-03 Hans-Böckler-Stiftung, ab 2006 Statistisches Bundesamt](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=867622817?usp=sharing)
- [Exporte: Statistisches Bundesamt](https://docs.google.com/spreadsheets/d/11dbhlLsjLfawjawMFPJp-CHkNUluT_4gQjU0K0L8j18/edit#gid=654710731?usp=sharing)

## Entwickeln
Das Longread-Template ist eine Web-Anwendung basierend auf HTML, Sass und JavaScript. Als Paketmanager kommt NPM zum Einsatz. Alle anderen Abhänigkeiten, wie Grunt und PostCSS, dienen nur dazu, einen optimierten Build zu erstellen.

### Enwicklungsserver
Zum lokalen Entwickeln ist ein kleiner [HTTP-Server](https://github.com/indexzero/http-server) integriert. Diesen kann man mit dem Befehl `npm start` starten. Der Server läuft unter http://localhost:8080. Beim Starten des Entwicklungsservers sollte automatisch ein neues Browserfenster aufgehen. 

### Stylesheets
Die Stylesheets sind modular in [Sass](http://sass-lang.com/) angelegt:
- **custom**: projektspezifische Stylesheets 
- **layout**: allgemeine Layout-Komponenten (Typo, Farben, Grid ...) 
- **modules**: komponentenspezifische Komponenten (Navigation, Footer, Zitate ...)

Um die Sass-Styles bei jeder Änderungen neu zu kompilieren, kann man den Sass-Watcher laufen lassen `npm run-script watch` oder `grunt watch`. Als Kompiler kommt [LibSass](http://sass-lang.com/libSass) zum Einsatz, welcher deutlich schneller ist als der alte Ruby-Sass-Kompiler. 

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
- Konfiguration aus der `draw.js` rausziehen
