function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null),
                },
            ],
            stepNumber: 0,
            xIsNext: true,
            AIMakingMove: false,
        };
    }
    // ======================================== Minimax
    player(board) {
        let empty_count = 0;
        let x_count = 0;
        let o_count = 0;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "X") {
                x_count += 1;
            } else if (board[i] == "O") {
                o_count += 1;
            }
        }

        if (x_count > o_count) {
            return "O";
        } else if (!this.terminal(board) && x_count === o_count) {
            return "X";
        } else {
            return "X";
        }

        // let empty_count = 0;
        // let x_count = 0;
        // let o_count = 0;
        // for (let i = 0; i < 9; i++) {
        //     if (board[i] === null) {
        //         empty_count += 1;
        //     } else if (board[i] === "X") {
        //         x_count += 1;
        //     } else {
        //         o_count += 1;
        //     }
        // }
        // if (empty_count === 9) {
        //     return "X";
        // } else if (x_count > o_count) {
        //     return "O";
        // } else {
        //     return "X";
        // }
    }

    // Returns set of all possible actions (i, j) available on the board.
    actions(board) {
        let actions = new Set(); //[];
        //let board_arr = [...board];

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) actions.add(i); // changed from tuple to array
        }

        return [...actions]; // changed from a set
    }

    result(board, action) {
        // Returns the board that results from making move (i, j) on the board.
        //JSON.parse(JSON.stringify(board));
        if (this.terminal(board) === true) {
            throw new Error("Terminal board in result.");
        }
        const possible_actions = this.actions(board);
        if (possible_actions.includes(action) === false) {
            throw new Error("Invalid action.");
        }

        const cur_player = this.player(board);
        //console.log(`Current player in result is ${cur_player}`);
        let board_copy = board.slice(); // changed from [...]

        board_copy[action] = cur_player;

        return board_copy;
    }

    winner(board) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    // need to add winner function

    terminal(board) {
        //console.log(`In terminal: this.winner ${this.winner(board)}`);
        if (this.winner(board) !== null) {
            return true;
        }

        const actions_left = this.actions(board);

        if (actions_left.length === 0) {
            return true;
        }

        return false;
    }

    utility(board) {
        let win = this.winner(board);
        //console.log(`Win is ${win}. Board is ${board}`);

        if (win === "X") {
            return 1;
        } else if (win === "O") {
            return -1;
        } else {
            return 0;
        }
    }

    minimax(board) {
        const is_terminal = this.terminal(board);
        if (is_terminal) {
            return null;
        }

        // # first get the player of board
        let cur_player = this.player(board);
        let best_action;
        //console.log(`${cur_player} cur_player in minimax`);

        if (cur_player === "X") {
            // # X is maximizing player

            let v = -10000;
            let possibleActions = this.actions(board);
            console.log(possibleActions);
            //console.log(`possible actions in minimax: ${possibleActions}`);
            for (let i = 0; i < possibleActions.length; i++) {
                //possibleActions.forEach((action) => {
                let k = this.min_value(this.result(board, possibleActions[i]));
                if (k > v) {
                    v = k;
                    best_action = possibleActions[i];
                }
            }
        } else {
            //# minimizing player

            let v = 10000;
            let possibleActions = this.actions(board); //[...this.actions(board)];
            console.log(possibleActions);
            //possibleActions.forEach((action) => {
            for (let i = 0; i < possibleActions.length; i++) {
                let k = this.max_value(this.result(board, possibleActions[i]));
                console.log(`k is ${k}, action is ${possibleActions[i]}`);
                if (k < v) {
                    v = k;
                    best_action = possibleActions[i];
                }
            }
        }
        return best_action;
    }

    max_value(board) {
        if (this.terminal(board)) {
            //console.log(`Utility is ${this.utility(board)}`);
            return this.utility(board);
        }

        let v = -10000;
        let possibleActions = this.actions(board);
        //for (let i = 0; i < possibleActions.length; i++) {
        possibleActions.forEach((action) => {
            let new_v = Math.max(v, this.min_value(this.result(board, action)));
            if (new_v >= v) {
                v = new_v;
            }
        });

        return v;
    }

    min_value(board) {
        if (this.terminal(board)) {
            return this.utility(board);
        }
        let v = 10000;
        let possibleActions = this.actions(board);
        possibleActions.forEach((action) => {
            let new_v = Math.min(v, this.max_value(this.result(board, action)));
            if (new_v <= v) {
                v = new_v;
            }
        });
        //possibleActions.forEach((action) => {
        // for (let i = 0; i < possibleActions.length; i++) {
        //     v = Math.min(
        //         v,
        //         this.max_value(this.result(board, possibleActions[i]))
        //     );
        // }

        return v;
    }

    makeAIMove() {
        console.log("clicked");
        //if (this.state.xIsNext === false) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        console.log(`Make AI move: player: ${this.player(squares)}`);
        // if (calculateWinner(squares)) {
        //     return;
        // }

        let action = this.minimax(squares);
        console.log(`Action from minimax is ${action}`);

        // if (calculateWinner(squares) || squares[action]) {
        //     return;
        // }

        ///print(action);
        squares[action] = this.player(squares); //this.state.xIsNext ? "X" : "O"; // replace this with minimax?
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                },
            ]),
            stepNumber: history.length,
            //xIsNext: !this.state.xIsNext,
        });

        //}
    }

    handleClick(i) {
        // if (this.state.AIMakingMove) {
        //     return;
        // }
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (this.winner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.player(squares); //this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares,
                },
            ]),
            stepNumber: history.length,
            //xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: step % 2 === 0,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = this.winner(current.squares); //calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ? "Go to move #" + move : "Go to game start";
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + this.player(current.squares);
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <button onClick={() => this.makeAIMove()}>
                        Make AI Move
                    </button>
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return squares[a];
        }
    }
    return null;
}
