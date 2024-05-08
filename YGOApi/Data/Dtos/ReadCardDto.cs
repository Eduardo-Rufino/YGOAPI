using System.ComponentModel.DataAnnotations;

namespace YGOApi.Data.Dtos
{
    public class ReadCardDto
    {

        
        public string Nome { get; set; }
        
        public string Atributo { get; set; }
        
        public int Nivel { get; set; }
        
        public string Tipo { get; set; }
        public string Efeito { get; set; }
        
        public int ATK { get; set; }
        
        public int DEF { get; set; }
        public string Colecao { get; set; }
        public DateTime HoraDaConsulta { get; set; } = DateTime.Now;
    }
}
