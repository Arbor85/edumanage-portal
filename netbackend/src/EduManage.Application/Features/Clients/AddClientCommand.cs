using EduManage.Application.Contracts;
using EduManage.Domain.Entities;
using MediatR;

namespace EduManage.Application.Features.Clients;

public sealed record AddClientCommand(ClientCreate Request, string UserId) : IRequest<ClientOut>
{
    internal sealed class Handler(IClientRepository repository) : IRequestHandler<AddClientCommand, ClientOut>
    {
        private static readonly string[] Prefixes =
        [
            "ACE", "ACT", "AID", "AIM", "AIR", "ARC", "ARM", "ART", "ASK", "AVE",
            "AXE", "BAY", "BIT", "BOX", "BUD", "CAP", "CIT", "COB", "COG", "CUE",
            "CUT", "DAB", "DAM", "DEN", "DIG", "DIM", "DIP", "DOT", "DUO", "DYE",
            "EAR", "ECO", "EDG", "ELM", "EMU", "ERA", "EVE", "FAB", "FAX", "FIG",
            "FIT", "FIX", "FLY", "FOB", "FOX", "FUN", "GEM", "GIG", "GIT", "GNU",
            "GOT", "GUM", "GUT", "GUY", "HEX", "HIT", "HOP", "HUB", "HUE", "HUT",
            "ICE", "INK", "ION", "IRE", "JAB", "JAM", "JAR", "JAW", "JET", "JIG",
            "JOB", "JOG", "JOT", "JOY", "JUG", "KAY", "KEG", "KIT", "LAB", "LAP",
            "LAW", "LAX", "LAY", "LED", "LEG", "LET", "LEV", "LID", "LIT", "LOG",
            "LOT", "LOW", "MAP", "MAR", "MAT", "MAX", "MOB", "MOD", "MOP", "MUD",
            "MUG", "NAP", "NAV", "NET", "NIL", "NIT", "NOD", "NOR", "NUB", "NUT"
        ];

        private static readonly string[] Segments = GenerateSegments();

        private static string[] GenerateSegments()
        {
            var letters = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890";
            var result = new string[9 * letters.Length];
            var idx = 0;
            for (var d = 1; d <= 9; d++)
                foreach (var c in letters)
                    result[idx++] = $"{d}{c}";
            return result;
        }

        private static string GenerateInvitationCode()
        {
            var rng = Random.Shared;
            var prefix = Prefixes[rng.Next(Prefixes.Length)];
            var segment = Segments[rng.Next(Segments.Length)];
            var number = rng.Next(0, 9999);

            return $"CLI-{prefix}-{segment}-{number:D4}";
        }

        public async Task<ClientOut> Handle(AddClientCommand request, CancellationToken cancellationToken)
        {
            var invitationCode = GenerateInvitationCode();
            var client = new Client(invitationCode, request.Request.Name, request.UserId, request.Request.Tags);

            await repository.AddAsync(client, cancellationToken);
            return new ClientOut(client.Name, client.Tags, client.ImageUrl, client.Status, client.InvitationCode, client.TrainerUserId, client.FirstName, client.LastName, client.Email, client.Gender);
        }
    }
}