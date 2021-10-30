export const commands = [
{
  name: 'pause',
  description: 'pausar la lista de reproduccion actual',
},
{
  name: 'resume',
  description: 'reanudar la lista pausada',
},
{
  name: 'list',
  description: 'ver la lista de reproduccion actual',
},
{
  name: 'skip',
  description: 'adelanta a la proxima cancion',
}
,
{
  name: 'stop',
  description: 'detiene la lista de reproduccion actual'
},
{
  name: 'go',
  description: 'reproduce la cancion con el indice seleccionado',
   options: [{ name: 'index', description: 'id de la cancion en la lista', type: 3}]
},
{
    name: 'p',
    description: 'Reproduce una canción',
    options: [{ name: 'param', description: 'Nombre Canción', type: 3}]
}];

