class MainLayer {

    constructor() {
        this.initiate();
    }

    initiate() {
        this.populateCellGrid();
        this.generateUpdateAndDrawKernels();
    }

    update() {
        let cellTexture = this.updateCellMatrix(columnNumber, rowNumber, this.cells, kernel);
        if (this.cells.delete) this.cells.delete();
        this.prev_cells[2] = this.prev_cells[1];
        this.prev_cells[1] = this.prev_cells[0];
        this.prev_cells[0] = this.cells;
        this.cells = cellTexture;
    }

    draw() {
        let history = [this.cells].concat(this.prev_cells);
        this.paintCells(
            history[0],
            history[1],
            history[2],
            history[3]);
    }

    populateCellGrid() {
        this.cells = [];
        for (let i = 0; i < rowNumber; i++) {
            this.cells[i] = []
            for (let j = 0; j < columnNumber; j++)
                this.cells[i].push(Math.random() > 0.5 ? 1 : 0);
        }
        this.prev_cells = [];
        for (let i = 1; i < 4; i++) {
            this.prev_cells.push(this.cells);
        }
    }

    generateUpdateAndDrawKernels() {
        this.gpu = new GPUX({ canvas, context: gl });

        this.gpu.addFunction(activation);

        this.updateCellMatrix = this.gpu.createKernel(function(columnNumber, rowNumber, cellMatrix, kernelValues) {
            let x = Math.floor(this.thread.x), y = Math.floor(this.thread.y);
            let yMinusOne = y == 0 ? rowNumber-1 : y-1;
            let yPlusOne = y == rowNumber-1 ? 0 : y+1;
            let xMinusOne = x == 0 ? columnNumber-1 : x-1;
            let xPlusOne = x == columnNumber-1 ? 0 : x+1;

            let updatedValue = cellMatrix[y][x]*kernelValues[1][1]
                        + cellMatrix[yMinusOne][x] * kernelValues[0][1]
                        + cellMatrix[y][xMinusOne] * kernelValues[1][0]
                        + cellMatrix[yMinusOne][xMinusOne] * kernelValues[0][0]
                        + cellMatrix[yPlusOne][x] * kernelValues[2][1]
                        + cellMatrix[y][xPlusOne] * kernelValues[1][2]
                        + cellMatrix[yPlusOne][xPlusOne] * kernelValues[2][2]
                        + cellMatrix[yMinusOne][xPlusOne] * kernelValues[0][2]
                        + cellMatrix[yPlusOne][xMinusOne] * kernelValues[2][0];
            return 0.0+activation(updatedValue);
        }, { immutable: true })
        .setOutput([columnNumber, rowNumber])
        .setPipeline(true);

        this.paintCells = this.gpu.createKernel(
            function(history0, history1, history2, history3) {
                let h0 = history0[this.thread.y][this.thread.x];
                let h1 = history1[this.thread.y][this.thread.x];
                let h2 = history2[this.thread.y][this.thread.x];
                let h3 = history3[this.thread.y][this.thread.x];
                let g = (h0 * h1 + h2 * h3) / 2.0;
                let r = h0 * h2;
                let b = h1 * h3;
                let green = (g <= 0.0 ? 0.0 :
                             g >= 1.0 ? 1.0 :
                             g);
                let red = (r <= 0.0 ? 0.0 :
                           r >= 1.0 ? 1.0 :
                           r);
                let blue = (b <= 0.0 ? 0.0 :
                            b >= 1.0 ? 1.0 :
                            b);
                this.color(red, green, blue, 1);
            }).setOutput([columnNumber, rowNumber])
            .setGraphical(true);

        this.fillCellArea = this.gpu.createKernel(function(columnNumber, rowNumber, cellMatrix, x, y) {
            let cellValue = cellMatrix[this.thread.y][this.thread.x];
            if (Math.abs(this.thread.x - x) < 10 && Math.abs(rowNumber - this.thread.y - y) < 10)
                return Math.random() > 0.5 ? 1 : 0;
            return cellValue;
        }, { immutable: true })
        .setOutput([columnNumber, rowNumber])
        .setPipeline(true);
    }

    handleTouch(ongoingTouches) {
        ongoingTouches
            .map(t => { let coord = { X: t.clientX, Y: t.clientY }; return coord; })
            .forEach(coord => {
                let touchResult = this.fillCellArea(columnNumber, rowNumber, this.cells, coord.X, coord.Y);
                if (this.cells.delete) this.cells.delete();
                this.cells = touchResult;
            });
    }
}

