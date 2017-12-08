import {stat} from 'fs';
import {hostname} from 'os';
import lnfs from 'lnfs';
import pify from 'pify';
import list from './list';

const statP = pify(stat);

export default () => list()
  .then(links => Promise.all(links
    .map(link => ({...link, dest: link.dest[hostname()]}))
    .filter(({dest}) => dest)
    .map(({src, dest, name}) => statP(src)
      .then(stats => stats.isDirectory() ? 'junction' : 'file')
      .then(type => lnfs(src, dest, type))
      .then(() => ({name, src, dest, status: 'linked'}))
      .catch(err => ({name, src, dest, error: err, status: err.code !== 'ENOENT' ? 'error' : 'missing'})))));