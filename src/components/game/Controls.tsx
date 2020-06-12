import React from 'react';
import Button from '@material-ui/core/Button';
import { Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import store from '../../redux/store';
import { initGame, resetScore, autoGames } from '../../redux/actions';

interface ControlProps {
  score?: number;
  iteration?: number;
  runningScore?: number;
  autoRun?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  score: {
    color: '#dd0',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  button: {
    marginBottom: theme.spacing(1)
  }
}));

const Controls: React.FC<ControlProps> = ({score, iteration, autoRun, runningScore}): JSX.Element => {
  
  const styles = useStyles({});

  const handleNewGame = ():void => {
    store.dispatch(initGame());
  };

  const handleAutomatedGames = ():void => {
    store.dispatch(autoGames());
  }

  const handleResetScore = ():void => {
    store.dispatch(resetScore());
  };

  return (
    <>
      <div className={styles.score}>
        <Typography variant="body1">
          <b>Score:</b> 
          {' '}
          {score || 0}
        </Typography>
        <Typography variant="body1">
          <b>Total Score:</b> 
          {' '}
          {runningScore || 0}
        </Typography>
        <Typography variant="body1">
          <b>Iteration:</b> 
          {' '}
          {iteration || 1 }
        </Typography>
        <Typography variant="body1">
          <b>Play Mode:</b> 
          {' '}
          {autoRun? 'Auto Play Active' : 'Manual Play Active' }
        </Typography>
      </div>

      <Button onClick={handleNewGame} className={styles.button} fullWidth color="primary" variant="contained">New Game</Button>
      <Button onClick={handleAutomatedGames} className={styles.button} fullWidth color="primary" variant="contained" disabled={autoRun ? true : false}>Start 100 Automated Games</Button>
      <Button onClick={handleResetScore} className={styles.button} fullWidth variant="contained">{autoRun ? "End Auto Play and Reset Score" : "Reset Score"}</Button>
    </>
  );
};

export default Controls;