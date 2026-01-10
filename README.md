# Osmotakut

CS2 taktiikkakirja Osmottaren tiimille.

## Testaus lokaalisti

```bash
python3 -m http.server 8080
```

Avaa: http://localhost:8080

## Taktiikoiden lisääminen

Muokkaa tiedostoa `tactics/[kartta]/tactics.md`

### Markdown-syntaksi

```markdown
# Otsikko
## Alaotsikko
### Pieni otsikko

**Lihavoitu teksti**
*Kursivoitu teksti*

- Lista kohta 1
- Lista kohta 2

---

> Huomautus tai vinkki
```

### Kuvat ja videot

```markdown
![Kuvateksti](images/kuva.jpg)

@[video](videos/video.mp4)

@[youtube](VIDEO_ID)
```

## Rakenne

```
tactics/
├── train/tactics.md
├── mirage/tactics.md
├── dust2/tactics.md
├── inferno/tactics.md
├── nuke/tactics.md
├── overpass/tactics.md
└── ancient/tactics.md
```
