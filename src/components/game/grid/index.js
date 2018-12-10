import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import obstruction from 'obstruction';
import { partial } from 'ap';
import windowSize from 'react-window-size';
import { classNames } from 'react-extras';

import { If } from 'react-extras';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Card from '../card';

import API from '../../../api';

const styles = theme => ({
  root: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  castle: {
    position: 'absolute',
    top: 0,
    minWidth: '100%',
    minHeight: '100%',
    paddingTop: 300,
    paddingLeft: 300,
    paddingRight: 300,
  },
  row: {
    position: 'relative',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'columns',
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    display: 'inline-block',
    width: 128,
    height: 128,
    margin: 10,

    '&.rotation1': {
      transform: 'rotate(90deg)'
    },
    '&.rotation2': {
      transform: 'rotate(180deg)'
    },
    '&.rotation3': {
      transform: 'rotate(270deg)'
    }
  }
});

class GridController extends Component {
  constructor (props) {
    super(props);

    this.state = {
      nodes: [],
      actions: [],
      rows: [],
      grid: {},
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };

    this.renderRow = this.renderRow.bind(this);
    this.renderCell = this.renderCell.bind(this);
    this.sendAction = this.sendAction.bind(this);
  }

  componentWillReceiveProps (newProps) {
    this.setState({...newProps.castles[newProps.playerId || 'test'],
      actions: newProps.actions.filter((action) => {
        if (action.action === 'BuildRoom') {
          return action.card === newProps.selectedCard;
        }
        return true;
      })
    });
  }

  async sendAction (action) {
    action = {...action,
      effects: []
    };
    API.send(action);
  }

  render () {
    console.log(this.state.actions);

    return (
      <div className={ this.props.classes.root }>
        <div
          className={ this.props.classes.castle }
          style={{
            left: 0 - this.props.x,
            top: 0 - this.props.y,
          }}
          >
        { this.state.rows.map(partial(this.renderRow, this.state.minX, this.state.minY)) }
        </div>
      </div>
    );
  }

  renderRow (minX, minY, row, i) {
    let y = this.state.maxY - i;
    return (
      <div key={ y } className={ this.props.classes.row } >
        { row.map(partial(this.renderCell, y, minX)) }
      </div>
    );
  }

  renderCell (y, minX, node, i) {
    let x = i + minX;
    let key = x + ':' + y;
    let isActionable = this.state.actions.reduce((memo, val) => {
      if (memo && memo.action === 'BuildRoom') {
        return memo;
      }
      if (val.room) {
        if (node && val.room === node.card) {
          return val;
        } else {
          return memo;
        }
      }
      if (node && val.card === node.card) {
        return val;
      }
      if (val.x === x && val.y === y) {
        return val;
      }
      return memo;
    }, false);

    if (!isActionable && node) {
      isActionable = this.props.actions.reduce((memo, val) => {
        if (val.card === node.card) {
          return val;
        }
        return memo;
      }, null);
    }

    return (
      <div key={ key } className={ classNames(this.props.classes.node, node && ('rotation' + node.rotation)) }>
        <If
          condition={ !!(node || isActionable) }
          render={ ()=>
            <Card
              card={ node ? node.card : 'empty' }
              onClick={ isActionable ? partial(this.sendAction, isActionable) : null }
              /> } />
      </div>
    );
  }
}

const mapToProps = obstruction({
  selectedCard: 'game.selectedCard',
  actions: 'game.actions',
  playerId: 'global.playerId',
  castles: 'game.castles',
  cards: 'cards.knownCards',
  x: 'minimap.x',
  y: 'minimap.y',
});

export default withStyles(styles)(connect(mapToProps)(windowSize(GridController)));