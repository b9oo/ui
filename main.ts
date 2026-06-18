namespace megaUI {

    // =========================
    // STATE
    // =========================
    let open = false

    let menuItems: string[] = []
    let selectedIndex = 0
    let onSelect: (i: number) => void = null

    let gridMode = false
    let gridCols = 1
    let gridRows = 1
    let gridItems: string[] = []

    let menuSprite: TextSprite = null
    let panel: Sprite = null
    let blur: Sprite = null

    let targetY = -40
    let currentY = -40

    let mouseEnabled = true

    // =========================
    // BLUR BACKGROUND
    // =========================
    function showBlur() {
        if (blur) blur.destroy()

        blur = sprites.create(img`
            11111111111111111111111111111111
            11111111111111111111111111111111
            11111111111111111111111111111111
            11111111111111111111111111111111
            11111111111111111111111111111111
            11111111111111111111111111111111
            11111111111111111111111111111111
            11111111111111111111111111111111
        `, SpriteKind.UI)

        blur.setFlag(SpriteFlag.Ghost, true)
        blur.z = 1000
        blur.setPosition(80, 60)
        blur.scale = 10
        blur.image.replace(1, 6) // darken look
    }

    function hideBlur() {
        if (blur) blur.destroy()
    }

    // =========================
    // PANEL (Minecraft style box)
    // =========================
    function showPanel() {
        if (panel) panel.destroy()

        panel = sprites.create(img`
            2222222222222222
            2111111111111112
            2111111111111112
            2111111111111112
            2111111111111112
            2111111111111112
            2111111111111112
            2222222222222222
        `, SpriteKind.UI)

        panel.setFlag(SpriteFlag.Ghost, true)
        panel.z = 1001
        panel.setPosition(80, currentY)
        panel.scale = 8
    }

    // =========================
    // DRAW MENU (LIST)
    // =========================
    function drawList() {
        if (menuSprite) menuSprite.destroy()

        let text = ""
        for (let i = 0; i < menuItems.length; i++) {
            text += (i == selectedIndex ? "▶ " : "  ") + menuItems[i] + "\n"
        }

        menuSprite = textsprite.create(text, 0, 15)
        menuSprite.setPosition(80, currentY)
        menuSprite.z = 1002
    }

    // =========================
    // DRAW GRID INVENTORY
    // =========================
    function drawGrid() {
        if (menuSprite) menuSprite.destroy()

        let text = ""
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                let i = r * gridCols + c
                if (i >= gridItems.length) continue

                let selected = (i == selectedIndex)
                text += selected ? "[X]" + gridItems[i] : "[ ]" + gridItems[i]
                text += "  "
            }
            text += "\n"
        }

        menuSprite = textsprite.create(text, 0, 15)
        menuSprite.setPosition(80, currentY)
        menuSprite.z = 1002
    }

    // =========================
    // OPEN LIST MENU
    // =========================
    export function openMenu(items: string[], callback: (i: number) => void) {
        menuItems = items
        gridMode = false
        onSelect = callback
        selectedIndex = 0

        open = true
        targetY = 60
        currentY = -80

        showBlur()
        showPanel()
        drawList()
    }

    // =========================
    // OPEN GRID MENU (INVENTORY)
    // =========================
    export function openGrid(items: string[], cols: number, rows: number, callback: (i: number) => void) {
        gridItems = items
        gridCols = cols
        gridRows = rows
        gridMode = true
        onSelect = callback
        selectedIndex = 0

        open = true
        targetY = 60
        currentY = -80

        showBlur()
        showPanel()
        drawGrid()
    }

    // =========================
    // CLOSE MENU
    // =========================
    export function close() {
        open = false
        hideBlur()
        if (menuSprite) menuSprite.destroy()
        if (panel) panel.destroy()
    }

    export function isOpen(): boolean {
        return open
    }

    // =========================
    // UPDATE ANIMATION
    // =========================
    game.onUpdate(function () {
        if (!open) return

        currentY += (targetY - currentY) * 0.2

        if (panel) panel.setPosition(80, currentY)
        if (menuSprite) menuSprite.setPosition(80, currentY)
    })

    // =========================
    // INPUT (KEYBOARD)
    // =========================
    controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
        if (!open) return
        selectedIndex = Math.max(0, selectedIndex - 1)
        refresh()
    })

    controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
        if (!open) return
        selectedIndex = Math.min(selectedIndex + 1, (gridMode ? gridItems.length - 1 : menuItems.length - 1))
        refresh()
    })

    controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
        if (!open || !onSelect) return
        onSelect(selectedIndex)
    })

    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        close()
    })

    function refresh() {
        if (gridMode) drawGrid()
        else drawList()
    }

    // =========================
    // TOUCH + MOUSE SUPPORT
    // =========================
    scene.onScreenTouched(function (x, y) {
        if (!open) return

        // simple touch select (closest index)
        let i = Math.idiv(y, 10)
        selectedIndex = i
        refresh()
    })

    // =========================
    // SAVE / LOAD SETTINGS
    // =========================
    export function saveSetting(key: string, value: number) {
        settings.writeNumber(key, value)
    }

    export function loadSetting(key: string, fallback: number): number {
        return settings.readNumber(key) || fallback
    }

    // =========================
    // MINECRAFT STYLE WINDOW
    // =========================
    export function openWindow(title: string, body: string) {
        open = true
        showBlur()
        showPanel()

        if (menuSprite) menuSprite.destroy()

        menuSprite = textsprite.create(title + "\n\n" + body, 0, 15)
        menuSprite.setPosition(80, 60)
        menuSprite.z = 1002
    }
}
